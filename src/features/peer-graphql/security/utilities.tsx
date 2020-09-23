import * as t from 'io-ts'
import * as E from 'fp-ts/lib/Either'
import { failure } from 'io-ts/lib/PathReporter'
import { flow } from 'fp-ts/lib/function'

export class Reducer {}

export function decode<A> (codec: t.Decoder<unknown, A>) {
  return flow(
    codec.decode,
    E.mapLeft(err => new Error(failure(err).join('\n')))
  )
}
