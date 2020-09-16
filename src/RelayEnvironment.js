import {
    Environment,
    Network,
    RecordSource,
    Store,
} from 'relay-runtime';
import { eventEmitter } from './features/peer-graphql/eventEmitter'

import { doSend } from './features/peer-graphql/websocket'

const response = ({ eventEmitter, hash }) => new Promise((resolve, reject) => {
    eventEmitter.once(hash, (data) => {
        resolve(data)
    });
    setTimeout(() => {
        eventEmitter.off(hash, resolve);
        reject({})
    }, 3000)
})

async function digestMessage(message) {
    const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);           // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
    return hashHex;
}


async function fetchQuery(
    operation,
    variables,
) {
    // hash graphql query for unique listener
    // In Relay networking layer. Outside of cache
    // hashing here to respond to unique event listener
    const hash = await digestMessage(operation.text);

    // send query to websocket
    doSend(JSON.stringify({
        message: 'request',
        query: operation.text,
        hash,
        variables,
    }));

    // listen on response from WebSocket
    return await response({ eventEmitter, hash })
}

const environment = new Environment({
    network: Network.create(fetchQuery),
    store: new Store(new RecordSource()),
});

export default environment;