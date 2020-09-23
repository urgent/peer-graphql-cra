import * as t from 'io-ts'

const Head = t.type({
  message: t.union([
    t.literal('request'),
    t.literal('response'),
    t.literal('configure')
  ]),
  hash: t.string
})

const Body = t.partial({
  query: t.string,
  variables: t.UnknownRecord,
  data: t.UnknownRecord
})

export const State = t.intersection([Head, Body])

export type ST = t.TypeOf<typeof State>
