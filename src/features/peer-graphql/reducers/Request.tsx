import { graphql as _graphql, ExecutionResult } from 'graphql'
import * as TE from 'fp-ts/lib/TaskEither'
import { pipe, flow } from 'fp-ts/lib/function'
import * as t from 'io-ts'
import { decode, wait } from '../peer'
import { schema } from '../schema'
import { doSend } from '../websocket'
import { Reducer } from '../reducer'
import { RES } from './Response'
import RelayEnvironment from '../../../RelayEnvironment'
import { fetchQuery } from 'react-relay/hooks'
import graphql from 'babel-plugin-relay/macro'

// define types for decode
const Request = t.type({
  uri: t.literal('request'),
  hash: t.string,
  query: t.string,
  variables: t.record(t.string, t.string)
})

export type REQ = t.TypeOf<typeof Request>

const ResponseQuery = graphql`
  query RequestQuery($hash: String) {
    response(hash: $hash) {
      time
    }
  }
`
const balance = (delay: number) => async (request: REQ): Promise<REQ> => {
  await wait(delay)
  console.log('request')
  console.log(await request)
  const result = (await fetchQuery(RelayEnvironment, ResponseQuery, {
    hash: request.hash
  }).toPromise()) as { data: [{}] }
  if (result.data.length > 0) {
    //throw new Error('Request already fulfilled')
  }

  return request
}

export async function query (request: Promise<REQ>): Promise<RES> {
  return pipe(
    await _graphql(schema, (await request).query),
    async (result: ExecutionResult) =>
      ({
        uri: 'response',
        hash: (await request).hash,
        data: result.data
      } as RES)
  )
}

export async function send (response: Promise<RES>): Promise<void> {
  console.log(await response)
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
  TE.map<REQ, Promise<REQ>>(balance(200)),
  TE.map<Promise<REQ>, Promise<RES>>(query),
  TE.map<Promise<RES>, Promise<void>>(send)
)
