import React from 'react';
import logo from './logo.svg';
import './App.css';
import './features/peer-graphql/websocket'
import {
  useLazyLoadQuery
} from 'react-relay/hooks';
import graphql from 'babel-plugin-relay/macro';





// Define a query
const HelloQuery = graphql`
query AppHelloQuery {
  hello
}
`;



function App(props) {
  const data = useLazyLoadQuery(HelloQuery)




  return (


    <React.Suspense fallback="Loading...">
      <View hello={data.hello} />
    </React.Suspense>
  )


}

function View({ hello }) {
  return <div className="App">
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
      <p>Hello, {hello}!</p>
    </header>
  </div>
}

export default App;
