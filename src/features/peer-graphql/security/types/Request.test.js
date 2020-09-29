import * as fc from 'fast-check';
import { graphql } from 'graphql'
import { schema } from '../../schema'
import { query } from './Request'

const request = {
    message: fc.constant("request"),
    hash: fc.hexaString(40, 40),
    query: fc.constant(`query AppHelloQuery {hello}`),
    variables: fc.constant({})
};

test('let query give a response message', (done) => {
    fc.assert(
        fc.asyncProperty(fc.record(request), async (a) => {
            const query1 = await query(a)
            expect(query1.message).toBe("response")
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
            const query2 = await graphql(schema, a.query)
            expect(query1.data).toMatchObject(query2.data)
            done()
        })
    )
})