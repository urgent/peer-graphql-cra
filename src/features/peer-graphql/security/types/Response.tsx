import * as IOE from 'fp-ts/lib/IOEither'
import { flow } from 'fp-ts/lib/function'
import * as t from 'io-ts'
import { decode, Reducer } from '../utilities'
import { EventEmitter } from 'events'
import { eventEmitter } from '../../eventEmitter'

const Response = t.type({
  message: t.literal('response'),
  hash: t.string,
  data: t.unknown
})

export type Response = t.TypeOf<typeof Response>

function emit (eventEmitter: EventEmitter) {
  return (response: Response) =>
    eventEmitter.emit(response.hash, { data: response.data })
}

declare module '../utilities' {
  export interface Reducer {
    response: (i: unknown) => IOE.IOEither<Error, void>
  }
}

Reducer.prototype.response = flow(
  decode(Response),
  IOE.fromEither,
  IOE.map<Response, void>(emit(eventEmitter))
)
