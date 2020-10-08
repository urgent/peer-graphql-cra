import React from 'react';
import logo from './logo.svg';
import './App.css';
import './features/peer-graphql/websocket'
import RelayEnvironment from './RelayEnvironment';
import { fetchQuery } from 'react-relay/hooks'
import graphql from 'babel-plugin-relay/macro';


// Define a query
const HelloQuery = graphql`
query AppHelloQuery {
  hello
}
`;

fetchQuery(
  RelayEnvironment,
  HelloQuery,
)
  .subscribe({
    start: () => { console.log('started graphql') },
    complete: () => { console.log('done') },
    error: (error) => { console.log('error'); console.log(error) },
    next: (data) => { console.log('data'); console.log(data) }
  });



function App(props) {


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
          {}
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
