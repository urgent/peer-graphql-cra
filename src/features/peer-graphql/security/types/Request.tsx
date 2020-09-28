import { graphql, ExecutionResult } from 'graphql'
import * as TE from 'fp-ts/lib/TaskEither'
import { pipe, flow } from 'fp-ts/lib/function'
import * as t from 'io-ts'
import { decode, Reducer } from '../peer'
import { schema } from '../../schema'
import { doSend } from '../../websocket'
import { RES } from './Response'

const Request = t.type({
  message: t.literal('request'),
  hash: t.string,
  query: t.string,
  variables: t.record(t.string, t.string)
})

export type REQ = t.TypeOf<typeof Request>

export async function format (request: REQ): Promise<RES> {
  return pipe(
    await graphql(schema, request.query),
    (result: ExecutionResult) =>
      ({
        message: 'response',
        hash: request.hash,
        data: result.data
      } as RES)
  )
}

export async function send (response: Promise<RES>): Promise<void> {
  return pipe(await response, JSON.stringify, doSend)
}

declare module '../peer' {
  export interface Reducer {
    request: (i: unknown) => TE.TaskEither<Error, Promise<void>>
  }
}

Reducer.prototype.request = flow(
  decode(Request),
  TE.fromEither,
  TE.map<REQ, Promise<RES>>(format),
  TE.map<Promise<RES>, Promise<void>>(send)
)
