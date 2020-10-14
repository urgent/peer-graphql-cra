import { EventEmitter } from 'events'
import * as R from 'fp-ts/lib/Reader'
import { fanout } from 'fp-ts/lib/Strong'
import { pipe, flow } from 'fp-ts/lib/function'
import { eventEmitter } from './eventEmitter'
import { doSend } from './websocket'
import { digestMessage } from './peer'
import { format, runtime } from './graphql/graphQLResponseWithData'
import { commitLocalUpdate } from 'react-relay'
import RelayEnvironment from '../../RelayEnvironment'

const respond = (eventEmitter: EventEmitter) => (hash: string) =>
  new Promise((resolve, reject) => {
    eventEmitter.once(hash, data => {
      commitLocalUpdate(RelayEnvironment, store => {
        store.delete(`client:Response:${hash}`)
      })
      resolve(data)
    })
    setTimeout(() => {
      eventEmitter.off(hash, resolve)
      reject({})
    }, 3000)
  })

const _respond = respond(eventEmitter)

export async function fetchQuery (operation: any, variables: any) {
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
    // convert runtime websocket promise to graphql data
    runtime
  )
}
