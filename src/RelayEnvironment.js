import {
    Environment,
    Network,
    RecordSource,
    Store,
} from 'relay-runtime';
import * as R from 'fp-ts/lib/Reader'
import { fanout } from 'fp-ts/lib/Strong'
import { pipe, flow } from 'fp-ts/lib/function'
import { eventEmitter } from './features/peer-graphql/eventEmitter'
import { doSend } from './features/peer-graphql/websocket'

const respond = (eventEmitter) => (hash) => new Promise((resolve, reject) => {
    eventEmitter.once(hash, (data) => {
        resolve(data)
    });
    setTimeout(() => {
        eventEmitter.off(hash, resolve);
        reject({})
    }, 3000)
})

const _respond = respond(eventEmitter);

async function digestMessage(message) {
    const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);           // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
    return hashHex;
}

const format = ({ operation, variables }) => (hash) => ({
    message: 'request',
    query: operation.text,
    hash,
    variables,
})

async function fetchQuery(operation, variables) {
    return pipe(
        // hash graphql query for unique listener
        await digestMessage(operation.text),
        // use hash as input for both send and _respond
        fanout({ ...R.Strong, ...R.Category })(
            // listen for response
            _respond,
            // send to websocket
            flow(
                // format message
                pipe(
                    { operation, variables },
                    format
                ),
                JSON.stringify,
                doSend
            )
        ),
        async ([result]) => await result
    )
}

const environment = new Environment({
    network: Network.create(fetchQuery),
    store: new Store(new RecordSource()),
});

export default environment;