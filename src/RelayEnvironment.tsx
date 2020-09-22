import {
  Environment,
  Network,
  RecordSource,
  Store,
  GraphQLResponseWithData
} from 'relay-runtime'
import * as t from 'io-ts'
import * as R from 'fp-ts/lib/Reader'
import * as E from 'fp-ts/lib/Either'
import { fanout } from 'fp-ts/lib/Strong'
import { pipe, flow, identity } from 'fp-ts/lib/function'
import { eventEmitter } from './features/peer-graphql/eventEmitter'
import { EventEmitter } from 'events'
import { doSend } from './features/peer-graphql/websocket'

const respond = (eventEmitter: EventEmitter) => (hash: string) =>
  new Promise((resolve, reject) => {
    eventEmitter.once(hash, data => {
      resolve(data)
    })
    setTimeout(() => {
      eventEmitter.off(hash, resolve)
      reject({})
    }, 3000)
  })

const _respond = respond(eventEmitter)

async function digestMessage (message: string) {
  const msgUint8 = new TextEncoder().encode(message) // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8) // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') // convert bytes to hex string
  return hashHex
}

const format = ({
  operation,
  variables
}: {
  operation: { text: string }
  variables: any
}) => (hash: string) => ({
  message: 'request',
  query: operation.text,
  hash,
  variables
})

// GraphQL response runtime to avoid typeguard

const PayloadData = t.type({
  data: t.UnknownRecord
})

const PayloadError = t.type({
  message: t.string
})

const Location = t.type({
  line: t.number,
  column: t.number
})

const Fault = t.partial({
  locations: t.array(Location),
  severity: t.union([
    t.literal('CRITICAL'),
    t.literal('ERROR'),
    t.literal('WARNING')
  ]) // Not officially part of the spec, but used at Facebook
})

const Meta = t.partial({
  errors: t.intersection([PayloadError, Fault]),
  extensions: t.UnknownRecord,
  label: t.string,
  path: t.union([t.array(t.string), t.array(t.number)])
})

const Runtime = t.intersection([PayloadData, Meta])
type Runtime = t.TypeOf<typeof Runtime>

async function fetchQuery (operation: any, variables: any) {
  return pipe(
    // hash graphql query for unique listener
    await digestMessage(operation.text),
    // use hash as input for both send and _respond
    fanout({ ...R.Strong, ...R.Category })(
      // listen for response
      _respond,
      // send to websocket
      flow(
        // format message
        pipe({ operation, variables }, format),
        JSON.stringify,
        // send
        doSend
      )
    ),
    async ([result]) =>
      pipe(
        await result,
        Runtime.decode,
        E.fold<t.Errors, Runtime, Runtime>(
          // format runtime decode error to graphql error
          (errors: t.Errors) => ({
            data: {},
            errors: { message: String(errors) }
          }),
          identity
        ),
        // cast WebSocket response to GraphQLResponse, as safely as possible because of runtime decode
        (runtime: Runtime) => runtime as GraphQLResponseWithData
      )
  )
}

const environment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource())
})

export default environment
