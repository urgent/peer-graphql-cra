import WebSocket from 'isomorphic-ws'
import { graphql } from 'graphql'
import { schema } from './schema'
import { eventEmitter } from './eventEmitter'
import * as TE from 'fp-ts/lib/TaskEither'
import * as IOE from 'fp-ts/lib/IOEither'
import * as E from 'fp-ts/lib/Either'
import { pipe, flow } from 'fp-ts/lib/function'
import * as t from 'io-ts'
import { failure } from 'io-ts/lib/PathReporter'
import { EventEmitter } from 'events'

export const socket = new WebSocket(
  'wss://connect.websocket.in/v3/1?apiKey=4sC6D9hsMYg5zcl15Y94nXNz8KAxr8eezGglKE9FkhRLnHcokuKsgCCQKZcW'
)

let queue: Array<string> = []

socket.onopen = function (evt: MessageEvent) {
  onOpen(evt)
}
socket.onclose = function (evt: CloseEvent) {
  onClose(evt)
}
socket.onmessage = function (evt: MessageEvent) {
  onMessage(evt)
}
socket.onerror = function (evt: MessageEvent) {
  onError(evt)
}

function onOpen (evt: MessageEvent) {
  writeToScreen('CONNECTED')
  while (queue.length > 0) {
    socket.send(queue.pop())
  }
}

function onClose (evt: CloseEvent) {
  writeToScreen('DISCONNECTED')
}

const Head = t.type({
  message: t.union([
    t.literal('request'),
    t.literal('response'),
    t.literal('config')
  ]),
  hash: t.string
})

const Body = t.partial({
  query: t.string,
  variables: t.UnknownRecord,
  data: t.UnknownRecord
})

const State = t.intersection([Head, Body])

type State = t.TypeOf<typeof State>

const Request = t.type({
  message: t.literal('request'),
  query: t.string,
  hash: t.string,
  variables: t.record(t.string, t.string)
})

type Request = t.TypeOf<typeof Request>

const Response = t.type({
  message: t.literal('response'),
  hash: t.string,
  data: t.unknown
})

type Response = t.TypeOf<typeof Response>

function decode<A> (codec: t.Decoder<unknown, A>) {
  return flow(
    codec.decode,
    E.mapLeft(err => new Error(failure(err).join('\n')))
  )
}

async function respond (request: Request) {
  pipe(await graphql(schema, request.query), result =>
    doSend(
      JSON.stringify({
        message: 'response',
        hash: request.hash,
        data: result.data
      })
    )
  )
}

function emit (eventEmitter: EventEmitter) {
  return (response: Response) =>
    eventEmitter.emit(response.hash, { data: response.data })
}

const _emit = emit(eventEmitter)

const reducer = {
  request: flow(
    decode(Request),
    TE.fromEither,
    TE.map<Request, Promise<void>>(respond)
  ),
  response: flow(
    decode(Response),
    IOE.fromEither,
    IOE.map<Response, void>(_emit)
  ),
  config: flow(
    decode(Request),
    TE.fromEither,
    TE.map<Request, Promise<void>>(respond)
  )
}

function onMessage (evt: MessageEvent) {
  pipe(
    E.parseJSON(evt.data, E.toError),
    E.mapLeft(err => new Error(String(err))),
    E.chain(decode(State)),
    E.map((state: State) => reducer[state.message](state))
  )

  const payload = JSON.parse(evt.data)
  if (payload.message === 'request') {
    graphql(schema, payload.query).then(result => {
      doSend(
        JSON.stringify({
          message: 'response',
          hash: payload.hash,
          data: result.data
        })
      )
    })
  } else if (payload.message === 'response') {
    eventEmitter.emit(payload.hash, { data: payload.data })
  }
}

function onError (evt: MessageEvent) {
  writeToScreen(evt.data)
}

export function doSend (message: string) {
  if (socket.readyState !== 1) {
    queue = [message, ...queue]
  } else {
    writeToScreen('SENT: ' + message)
    socket.send(message)
  }
}

function writeToScreen (message: string) {
  console.log(message)
}
