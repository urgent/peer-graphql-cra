import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql'

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      hello: {
        type: GraphQLString,
        resolve () {
          // no one automerge. 250kb bundle size, non gzip, just for last write wins and history.
          // need io-ts to graphql
          // or graphql to io-ts
          return 'world'
        }
      }
    }
  })
})
