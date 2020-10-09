import * as fc from 'fast-check';
import { graphql as _graphql } from 'graphql'
import { schema, root } from '../graphql/resolve'
import { query, balance } from './Request'
import { commitLocalUpdate } from 'react-relay'
import RelayEnvironment from '../../../RelayEnvironment'
import { fetchQuery } from 'react-relay/hooks'
import graphql from 'babel-plugin-relay/macro';



const request = {
    uri: fc.constant("request"),
    hash: fc.hexaString(40, 40),
    query: fc.constant(`query AppHelloQuery {hello}`),
    variables: fc.constant({})
};

test('let query give a response uri', (done) => {
    fc.assert(
        fc.asyncProperty(fc.record(request), async (a) => {
            const query1 = await query(a)
            expect(query1.uri).toBe("response")
            done()
        })
    )
})

test('let query twice be the same data as query once', (done) => {
    fc.assert(
        fc.asyncProperty(fc.record(request), async (a) => {
            const query1 = await query(a)
            const query2 = await query(a)
            expect(query1.data).toMatchObject(query2.data)
            done()
        })
    )
})

test('let query data hello to be world', (done) => {
    fc.assert(
        fc.asyncProperty(fc.record(request), async (a) => {
            const query1 = await query(a)
            expect(query1.data.hello).toBe('world')
            done()
        })
    )
})

test('let query to give the same data as graphql ', (done) => {
    fc.assert(
        fc.asyncProperty(fc.record(request), async (a) => {
            const query1 = await query(a)
            const query2 = await _graphql(schema, a.query, root)
            expect(query1.data).toMatchObject(query2.data)
            done()
        })
    )
})

test('response query works ', async (done) => {
    const query = await _graphql(schema, `query ResponseQuery {response{hash,time}}`, root);
    expect(query.data).toMatchObject({ response: [{ hash: '123', time: '1234' }] })
    done()
})