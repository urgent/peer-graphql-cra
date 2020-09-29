import * as fc from 'fast-check';
import * as E from 'fp-ts/lib/Either'
import { pipe, identity } from 'fp-ts/lib/function'
import { reduce } from './peer'
import './types/Request'
import './types/Response'
import './types/Configure'

function reverse(s) {
    return [...s].reverse().join("");
}

const request = {
    message: fc.constant("request"),
    hash: fc.hexaString(40, 40),
    query: fc.constant(`query AppHelloQuery {hello}`),
    variables: fc.constant({})
};

const response = {
    message: fc.constant("response"),
    hash: fc.hexaString(40, 40),
    data: fc.constant({ hello: 'world' }),
}

const fold = (func) => (a) => pipe(
    reduce({ data: JSON.stringify(a) }),
    E.fold(
        identity,
        func
    )
)

const hash = fold(([, { hash }]) => hash)
const state = fold(([, state]) => state)
const task = fold(([task]) => task)

test('let relay then reverse hash be the same as reverse hash then relay', () => {
    fc.assert(
        fc.property(
            fc.record(request), fc.record(response), (a, b) => {
                const hash1 = reverse(hash(a));
                const hash2 = hash({ ...a, hash: reverse(a.hash) })
                expect(hash1).toEqual(hash2);
                const hash3 = reverse(hash(b));
                const hash4 = hash({ ...b, hash: reverse(b.hash) })
                expect(hash3).toEqual(hash4);
            })
    );
});

test('let state returned from relay({message:"response"}) be the same as deserialized input', () => {
    fc.assert(
        fc.property(
            fc.record(response), (a) => {
                expect(state(a)).toEqual(a);
            })
    );
});

test('let relay twice is the same thing as relay once', () => {
    fc.assert(
        fc.property(
            fc.record(request), fc.record(response), (a, b) => {
                expect(state(a)).toEqual(a);
                expect(state(a)).toEqual(a);
                expect(state(b)).toEqual(b);
                expect(state(b)).toEqual(b);
            })
    );
});

test('let tasks returned from relay({message:"request"}) and relay({message:"response"}) to be function types', () => {
    fc.assert(
        fc.property(
            fc.record(request), fc.record(response), (a, b) => {
                expect(typeof task(a)).toEqual('function');
                expect(typeof task(b)).toEqual('function');
            })
    );
});