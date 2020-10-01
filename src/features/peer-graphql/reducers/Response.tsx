import * as IOE from 'fp-ts/lib/IOEither'
import { flow } from 'fp-ts/lib/function'
import * as t from 'io-ts'
import { decode } from '../peer'
import { EventEmitter } from 'events'
import { eventEmitter } from '../eventEmitter'
import { Reducer } from '../reducer'

const Response = t.type({
  message: t.literal('response'),
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

function emit (eventEmitter: EventEmitter) {
  return (response: RES) =>
    eventEmitter.emit(response.hash, { data: response.data })
}

Reducer.prototype.response = flow(
  decode(Response),
  IOE.fromEither,
  IOE.map<RES, void>(emit(eventEmitter))
)
