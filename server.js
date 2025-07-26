const WebSocket = require('ws')
const http = require('http')
const { setupWSConnection } = require('y-websocket/bin/utils')

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('Yjs WebSocket Server is running')
})

const wss = new WebSocket.Server({ server })

wss.on('connection', setupWSConnection)

const port = 1234
server.listen(port, () => {
  console.log(`Yjs WebSocket Server is running on port ${port}`)
  console.log('You can now test collaborative editing!')
})
