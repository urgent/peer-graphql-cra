import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { RelayEnvironmentProvider } from 'react-relay/hooks';
import RelayEnvironment from './RelayEnvironment';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.    
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service    
    console.log(error)
    console.log(errorInfo);
  }
  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI      
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}


const ErrorUI = ({ error }) => <div>{error}</div>

ReactDOM.unstable_createRoot(document.getElementById('root')).render(
  <React.Suspense fallback="Loading 1 ...">
    <ErrorBoundary fallback={error => <ErrorUI error={error} />}>

      <RelayEnvironmentProvider environment={RelayEnvironment}>
        <App />
      </RelayEnvironmentProvider>

    </ErrorBoundary>
  </React.Suspense>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

