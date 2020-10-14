export default `scalar DateTime

type Keypair {
  pair: String
}

type Response {
  hash: String
  time: DateTime
}

type Query {
  hello: String
  goodbye: String
  response(hash: String): [Response]
}
`