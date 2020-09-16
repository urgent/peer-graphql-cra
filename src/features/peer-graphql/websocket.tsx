import WebSocket from 'isomorphic-ws'
import { graphql } from 'graphql'
import { schema } from './schema'
import { eventEmitter } from './eventEmitter'

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

function onMessage (evt: MessageEvent) {
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
