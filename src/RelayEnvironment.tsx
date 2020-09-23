import { Environment, Network, RecordSource, Store } from 'relay-runtime'
import { fetchQuery } from './features/peer-graphql/fetchQuery'

const environment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource())
})

export default environment
