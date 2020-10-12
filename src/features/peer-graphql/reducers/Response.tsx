import * as IOE from 'fp-ts/lib/IOEither'
import { flow } from 'fp-ts/lib/function'
import * as t from 'io-ts'
import { decode } from '../peer'
import { EventEmitter } from 'events'
import { eventEmitter } from '../eventEmitter'
import { Reducer } from '../reducer'
import { commitLocalUpdate } from 'react-relay'
import RelayEnvironment from '../../../RelayEnvironment'
import { createOperationDescriptor, getRequest } from 'relay-runtime'
import graphql from 'babel-plugin-relay/macro'

const Response = t.type({
  uri: t.literal('response'),
  hash: t.string,
  data: t.unknown
})

export type RES = t.TypeOf<typeof Response>

declare module '../reducer' {
  export interface Reducer {
    response: (i: unknown) => IOE.IOEither<Error, void>
  }

  export interface URI2Type {
    response: RES
  }
}

const ResponseQuery = graphql`
  query ResponseQuery($hash: String) {
    response(hash: $hash) {
      hash
      time
    }
  }
`

export function cache (request: RES): IOE.IOEither<Error, RES> {
  // side-effect, add record
  commitLocalUpdate(RelayEnvironment, store => {
    store.create(`client:Response:${request.hash}`, 'Response')
  })

  // used for gc
  const concreteRequest = getRequest(ResponseQuery)
  const operation = createOperationDescriptor(concreteRequest, {
    hash: request.hash
  })
  RelayEnvironment.retain(operation)

  return IOE.right(request)
}

function emit (eventEmitter: EventEmitter) {
  return (response: RES) =>
    eventEmitter.emit(response.hash, { data: response.data })
}

Reducer.prototype.response = flow(
  decode(Response),
  IOE.fromEither,
  IOE.chain(cache),
  IOE.map<RES, void>(emit(eventEmitter))
)
