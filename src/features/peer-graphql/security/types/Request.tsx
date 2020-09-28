import { graphql, ExecutionResult } from 'graphql'
import { schema } from '../../schema'
import { doSend } from '../../websocket'
import * as TE from 'fp-ts/lib/TaskEither'
import { pipe, flow } from 'fp-ts/lib/function'
import * as t from 'io-ts'
import { decode, Reducer } from '../peer'

const Request = t.type({
  message: t.literal('request'),
  hash: t.string,
  query: t.string,
  variables: t.record(t.string, t.string)
})

export type REQ = t.TypeOf<typeof Request>

export async function respond (request: REQ) {
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

declare module '../peer' {
  export interface Reducer {
    request: (i: unknown) => TE.TaskEither<Error, Promise<void>>
  }
}

Reducer.prototype.request = flow(
  decode(Request),
  TE.fromEither,
  TE.map<REQ, Promise<void>>(respond)
)
