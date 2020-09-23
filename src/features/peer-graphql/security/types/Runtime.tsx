import * as t from 'io-ts'
import { GraphQLResponseWithData } from 'relay-runtime'
import * as E from 'fp-ts/lib/Either'
import { pipe, identity } from 'fp-ts/lib/function'

const PayloadData = t.type({
  data: t.UnknownRecord
})

const PayloadError = t.type({
  message: t.string
})

const Location = t.type({
  line: t.number,
  column: t.number
})

const Fault = t.partial({
  locations: t.array(Location),
  severity: t.union([
    t.literal('CRITICAL'),
    t.literal('ERROR'),
    t.literal('WARNING')
  ]) // Not officially part of the spec, but used at Facebook
})

const Meta = t.partial({
  errors: t.intersection([PayloadError, Fault]),
  extensions: t.UnknownRecord,
  label: t.string,
  path: t.union([t.array(t.string), t.array(t.number)])
})

const Runtime = t.intersection([PayloadData, Meta])
type RUN = t.TypeOf<typeof Runtime>

/**
 * Generic runtime to GraphQLResponseWithData
 * @param {any} result runtime data
 * @returns {GraphQLResponseWithData} runtime decoded response with decode errors if any
 */
export const runtime = async ([result]: [Promise<unknown>, void]) =>
  pipe(
    await result,
    Runtime.decode,
    E.fold<t.Errors, RUN, RUN>(
      // format runtime decode error to graphql error
      (errors: t.Errors) => ({
        data: {},
        errors: { message: String(errors) }
      }),
      identity
    ),
    // cast WebSocket response to GraphQLResponse, as safely as possible because of runtime decode
    (runtime: RUN) => runtime as GraphQLResponseWithData
  )

/**
 * GraphQL operation to WebSocket request
 * @param {any, any} fetch {operation, variables} to format
 * @return {} WebSocket request from graphql operation
 */
export const format = ({
  operation,
  variables
}: {
  operation: { text: string }
  variables: any
}) => (hash: string) => ({
  message: 'request',
  query: operation.text,
  hash,
  variables
})
