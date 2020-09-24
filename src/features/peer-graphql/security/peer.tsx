import * as t from 'io-ts'
import * as E from 'fp-ts/lib/Either'
import { failure } from 'io-ts/lib/PathReporter'
import { flow, pipe } from 'fp-ts/lib/function'
import { ST, State } from './types/State'
import { TaskEither } from 'fp-ts/lib/TaskEither'
import { IOEither } from 'fp-ts/lib/IOEither'

/**
 * Extensible map of message to function
 */
export class Reducer {}

type Reduction = E.Either<
  Error,
  [TaskEither<Error, Promise<void>> | IOEither<Error, void>, ST]
>

/**
 * Respond to WebSocket payload with applicable reducer
 * @param evt WebSocket payload
 */
export const reduce = (evt: MessageEvent): Reduction =>
  pipe(
    E.parseJSON(evt.data, E.toError),
    E.mapLeft(err => {
      return new Error(String(err))
    }),
    E.chain(decode(State)),
    // tuple for testing
    E.map((state: ST) => [Reducer.prototype[state.message](state), state])
  )

export const relay = flow(
  reduce,
  E.map(([reduction]) => reduction())
)

export function decode<A> (codec: t.Decoder<unknown, A>) {
  return flow(
    codec.decode,
    E.mapLeft(err => new Error(failure(err).join('\n')))
  )
}

export async function digestMessage (message: string) {
  const msgUint8 = new TextEncoder().encode(message) // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8) // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') // convert bytes to hex string
  return hashHex
}
