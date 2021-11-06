const express = require('express')
const app = express()
const server = require('http').createServer(app)
const nameGenerator = require('./nameGenerator.js')
const mathQuestionGenerator = require('./math.js')
const WebSocket = require('ws')
const { v4: uuidv4 } = require('uuid')
const wss = new WebSocket.Server({ server: server })
const difficulty = 2.5
const questionDuration = 5;
let currentQuestion;
let questionTime;

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
  ws.answered = false
  ws.deltaTime = 0
}

const sendPlayerData = () => {
  const allPlayerData = [...wss.clients.values()].map(e => {
    return {
      id: e.id,
      name: e.name,
      score: e.score,
      deltaTime: e.deltaTime
    }
  })
  allPlayerData.sort((a, b) => b.score - a.score)
  sendToAll({
    type: 'playerData',
    data: allPlayerData
  })
}

const resetAnswers = () => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.answered = false;
      client.deltaTime = 0;
    }
  })
}

const sendMathQuestion = () => {
  questionTime = Date.now()
  currentQuestion = mathQuestionGenerator(difficulty)
  sendToAll({
    type: 'mathQuestion',
    data: {
      num1: currentQuestion.num1,
      num2: currentQuestion.num2,
      type: currentQuestion.type,
      time: questionDuration
    }
  })
}

const sendId = (ws) => {
  ws.send(JSON.stringify({
    type: 'id',
    data: {
      id: ws.id
    }
  }))
}

const handleAnswers = (ws, msg) => {
  const parsed = JSON.parse(msg)
  if (currentQuestion && !ws.answered) {
    if (parsed.answer == currentQuestion.answer) {
      ws.answered = true
      ws.send(JSON.stringify({
        type: 'answer',
        data: {
          status: 'correct'
        }
      }))
    } else {
      ws.send(JSON.stringify({
        type: 'answer',
        data: {
          status: 'wrong'
        }
      }))
    }
  }
}

wss.on('connection', (ws) => {
  printClientCount()
  configureNewClient(ws)
  sendId(ws)
  sendPlayerData()
  ws.on('message', (msg) => handleAnswers(ws, msg))
  ws.on('close', () => {
    printClientCount()
    sendPlayerData()
  })
})

setInterval(() => {
  resetAnswers()
  sendMathQuestion()
}, questionDuration * 1000)

server.listen(3000, () => console.log(`Lisening on port :3000`))