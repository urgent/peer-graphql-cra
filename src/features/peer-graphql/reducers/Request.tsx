import { graphql as _graphql, ExecutionResult } from 'graphql'
import * as TE from 'fp-ts/lib/TaskEither'
import { pipe, flow } from 'fp-ts/lib/function'
import * as t from 'io-ts'
import { decode } from '../peer'
import { schema, root } from '../graphql/resolve'
import { doSend } from '../websocket'
import { Reducer } from '../reducer'
import { RES } from './Response'
import RelayEnvironment from '../../../RelayEnvironment'
import { commitLocalUpdate } from 'react-relay'

// define types for decode
const Request = t.type({
  uri: t.literal('request'),
  hash: t.string,
  query: t.string,
  variables: t.record(t.string, t.string)
})

export type REQ = t.TypeOf<typeof Request>

export function check (request: REQ): TE.TaskEither<Error, REQ> {
  // side-effect, get record
  const data = RelayEnvironment.getStore()
    .getSource()
    .get(`client:Response:${request.hash}`) as REQ
  if (data) {
    commitLocalUpdate(RelayEnvironment, store => {
      console.log('delete from request handler')
      store.delete(`client:Response:${request.hash}`)
    })
    return TE.left(new Error('Response already fulfilled'))
  } else {
    return TE.right(request)
  }
}

export async function query (request: REQ): Promise<RES> {
  return pipe(
    await _graphql(schema, request.query, root),
    async (result: ExecutionResult) =>
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
    request: (i: { delay: number }) => TE.TaskEither<Error, Promise<void>>
  }

  export interface URI2Type {
    request: REQ
  }
}

function delay (): (
  ma: TE.TaskEither<Error, REQ>
) => TE.TaskEither<Error, REQ> {
  return ma => () =>
    new Promise(resolve => {
      setTimeout(() => {
        ma().then(resolve)
      }, (Math.floor(Math.random() * 150) + 1) * 20)
    })
}

Reducer.prototype.request = flow(
  decode(Request),
  TE.fromEither,
  TE.mapLeft(err => new Error(String(err))),
  delay(),
  TE.chain<Error, REQ, REQ>(check),
  TE.chain<Error, REQ, Promise<RES>>(flow(query, TE.right)),
  TE.chain<Error, Promise<RES>, Promise<void>>(flow(send, TE.right))
)
