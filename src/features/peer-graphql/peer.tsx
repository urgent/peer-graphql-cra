import * as t from 'io-ts'
import * as E from 'fp-ts/lib/Either'
import { failure } from 'io-ts/lib/PathReporter'
import { flow, pipe } from 'fp-ts/lib/function'
import { TaskEither } from 'fp-ts/lib/TaskEither'
import { IOEither } from 'fp-ts/lib/IOEither'
import { Reducer, URI2Type, Props } from './reducer'
import './reducers/Request'
import './reducers/Response'
import './reducers/Configure'

type URIS = keyof URI2Type

declare module './reducer' {
  export interface Props {
    uri: URIS
  }
}

/**
 * Enforces return value from reducer to be callable
 */
export type Reduction = E.Either<
  Error,
  [TaskEither<Error, Promise<void>> | IOEither<Error, void>, Props]
>

/**
 * Respond to WebSocket payload with applicable reducer
 * @param {MessageEvent} evt WebSocket payload
 * @return {Reduction} Error or task of reducer
 */
export const reduce = (evt: MessageEvent): Reduction =>
  pipe(
    E.parseJSON(evt.data, E.toError),
    E.mapLeft(err => {
      return new Error(String(err))
    }),
    E.chain(
      // need to widen json. Indexing for extensibility complicates type checks
      (json: any): E.Either<Error, Props> =>
        pipe(Object.assign({ uri: '', ...json }), E.right)
    ),
    // tuple for testing
    E.map((props: Props) => [Reducer.prototype[props.uri](props), props])
  )

/**
 * Run side-effects returned by reducer
 * @param {MessageEvent} evt WebSocket payload
 * @return {Reduction} Error or results of reducer call
 */
export const relay = flow(
  reduce,
  E.map(([reduction]) => reduction())
)

/**
 * Run codec on unknown value and make errors printable
 * @param {t.Decoder<unknown, A>} codec
 * @param {unknown} i payload to decode
 * @return {E.Either<Error, A>} decode results, Error or type
 */
export function decode<A> (codec: t.Decoder<unknown, A>) {
  return flow(
    codec.decode,
    E.mapLeft(err => new Error(failure(err).join('\n')))
  )
}

/**
 * SHA-1 hash for string to unique token
 * @param {string} message generic string to hash
 * @returns {string} SHA-1 hash
 */
export async function digestMessage (message: string) {
  const msgUint8 = new TextEncoder().encode(message) // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8) // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') // convert bytes to hex string
  return hashHex
}

export function wait (delay: number) {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, delay)
  })
}
