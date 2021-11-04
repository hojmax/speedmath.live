const express = require('express')
const app = express()
const server = require('http').createServer(app)
const nameGenerator = require('./nameGenerator.js')
const mathQuestionGenerator = require('./math.js')
const WebSocket = require('ws')
const { v4: uuidv4 } = require('uuid')
const wss = new WebSocket.Server({ server: server })
let currentQuestion = undefined;

const printClientCount = () => console.log('Clients connected:', wss.clients.size)

const sendToAll = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  })
}

const configureNewClient = (ws) => {
  ws.id = uuidv4()
  ws.name = nameGenerator()
  ws.score = 0
}

const sendPlayerData = () => {
  const allPlayerData = [...wss.clients.values()].map(e => {
    return {
      name: e.name,
      score: e.score
    }
  })
  allPlayerData.sort((a, b) => b.score - a.score)
  sendToAll({
    type: 'playerData',
    data: allPlayerData
  })
}

const sendMathQuestion = () => {
  currentQuestion = mathQuestionGenerator(2)
  sendToAll({
    type: 'mathQuestion',
    data: {
      num1: currentQuestion.num1,
      num2: currentQuestion.num2,
      type: currentQuestion.type,
    }
  })
}


wss.on('connection', (ws) => {
  printClientCount()
  configureNewClient(ws)
  sendPlayerData()
  ws.on('message', (message) => {
    console.log('received: %s', message)
  })
  ws.on('close', (message) => {
    printClientCount()
    sendPlayerData()
  })
})

setInterval(sendMathQuestion, 3000)

server.listen(3000, () => console.log(`Lisening on port :3000`))