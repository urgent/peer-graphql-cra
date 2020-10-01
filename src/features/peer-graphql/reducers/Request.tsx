import { graphql, ExecutionResult } from 'graphql'
import * as TE from 'fp-ts/lib/TaskEither'
import { pipe, flow } from 'fp-ts/lib/function'
import * as t from 'io-ts'
import { decode } from '../peer'
import { schema } from '../schema'
import { doSend } from '../websocket'
import { Reducer } from '../reducer'
import { RES } from './Response'

// define types for decode
const Request = t.type({
  uri: t.literal('request'),
  hash: t.string,
  query: t.string,
  variables: t.record(t.string, t.string)
})

export type REQ = t.TypeOf<typeof Request>

//define functions to run
export async function query (request: REQ): Promise<RES> {
  return pipe(
    await graphql(schema, request.query),
    (result: ExecutionResult) =>
      ({
        uri: 'response',
        hash: request.hash,
        data: result.data
      } as RES)
  )
}

export async function send (response: Promise<RES>): Promise<void> {
  return pipe(await response, JSON.stringify, doSend)
}

//extend interface
declare module '../reducer' {
  export interface Reducer {
    request: (i: unknown) => TE.TaskEither<Error, Promise<void>>
  }

  export interface URI2Type {
    request: REQ
  }
}

// extend reducer
Reducer.prototype.request = flow(
  decode(Request),
  TE.fromEither,
  TE.map<REQ, Promise<RES>>(query),
  TE.map<Promise<RES>, Promise<void>>(send)
)
