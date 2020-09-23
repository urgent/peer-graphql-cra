import { graphql, ExecutionResult } from 'graphql'
import { schema } from '../../schema'
import { doSend } from '../../websocket'
import * as TE from 'fp-ts/lib/TaskEither'
import { pipe, flow } from 'fp-ts/lib/function'
import * as t from 'io-ts'
import { decode, Reducer } from '../utilities'

const Request = t.type({
  message: t.literal('request'),
  query: t.string,
  hash: t.string,
  variables: t.record(t.string, t.string)
})

export type Request = t.TypeOf<typeof Request>

export async function respond (request: Request) {
  pipe(await graphql(schema, request.query), (result: ExecutionResult) =>
    doSend(
      JSON.stringify({
        message: 'response',
        hash: request.hash,
        data: result.data
      })
    )
  )
}

declare module '../utilities' {
  export interface Reducer {
    request: (i: unknown) => TE.TaskEither<Error, Promise<void>>
  }
}

Reducer.prototype.request = flow(
  decode(Request),
  TE.fromEither,
  TE.map<Request, Promise<void>>(respond)
)
