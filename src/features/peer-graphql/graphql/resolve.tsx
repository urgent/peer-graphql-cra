import { buildSchema } from 'graphql'
import typedef from './codegen.typedef.dist'

// Construct a schema, using GraphQL schema language
export const schema = buildSchema(typedef)

// The root provides a resolver function for each API endpoint
export const root = {
  hello: () => {
    return 'world'
  },
  response: (args: unknown) => {
    return [
      {
        hash: '123',
        time: '1234'
      }
    ]
  }
}
