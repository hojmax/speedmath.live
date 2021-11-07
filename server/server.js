const express = require('express')
const app = express()
const server = require('http').createServer(app)
const nameGenerator = require('./nameGenerator.js')
const mathQuestionGenerator = require('./math.js')
const WebSocket = require('ws')
const { v4: uuidv4 } = require('uuid')
const wss = new WebSocket.Server({ server: server })
const options = require('./options.json');
let questionTimer
let gameRunning = false
let roundCounter = 0
let currentQuestion
let questionTime

const printClientCount = () => console.log('Clients connected:', wss.clients.size)

const sendToAll = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data))
    }
  })
}

const configureNewClient = (ws) => {
  ws.id = uuidv4()
  ws.name = nameGenerator()
  ws.score = 0
  ws.answered = false
  ws.correctRounds = 0
  ws.deltaScore = 0
}

const sendPlayerData = () => {
  const allPlayerData = [...wss.clients.values()].map(e => {
    return {
      id: e.id,
      name: e.name,
      score: e.score,
      deltaScore: e.deltaScore
    }
  })
  allPlayerData.sort((a, b) => b.score - a.score)
  sendToAll({
    type: 'playerData',
    data: allPlayerData
  })
}

const resetGame = () => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.answered = false
      client.deltaScore = 0
      client.score = 0
      client.correctRounds = 0
    }
  })
}

const resetRound = () => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.answered = false
      client.deltaScore = 0
    }
  })
}

const sendMathQuestion = () => {
  questionTime = Date.now()
  currentQuestion = mathQuestionGenerator(options.difficulty)
  sendToAll({
    type: 'mathQuestion',
    data: {
      num1: currentQuestion.num1,
      num2: currentQuestion.num2,
      type: currentQuestion.type,
      time: options.questionDuration,
      round: roundCounter,
      totalRounds: options.totalRounds,
    }
  })
}

const sendPodium = () => {
  const allPlayerData = [...wss.clients.values()].map(e => {
    return {
      id: e.id,
      name: e.name,
      score: e.score,
      correctRounds: e.correctRounds,
    }
  })
  allPlayerData.sort((a, b) => b.score - a.score)
  const podium = allPlayerData.splice(0, 3)
  sendToAll({
    type: 'podium',
    data: {
      players: podium,
      time: options.podiumDuration,
      totalRounds: options.totalRounds,
    },
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

const calculateScore = () => {
  return Math.ceil(500 - (Date.now() - questionTime) / (options.questionDuration * 2)) + 500
}

const sendChatMessage = (ws, msg) => {
  sendToAll({
    type: 'chat',
    data: {
      time: Date.now(),
      name: ws.name,
      message: msg
    },
  })
}

const handleCorrectAnswer = (ws) => {
  ws.correctRounds += 1
  ws.answered = true
  ws.deltaScore = calculateScore()
  ws.score += ws.deltaScore
  ws.send(JSON.stringify({
    type: 'answer',
    data: {
      correct: true
    }
  }))
  sendPlayerData()
}

const handleWrongAnswer = (ws) => {
  ws.send(JSON.stringify({
    type: 'answer',
    data: {
      correct: false
    }
  }))
}

const stopGame = () => {
  gameRunning = false
  clearInterval(questionTimer)
  roundCounter = 0
  sendPodium()
  resetGame()
}

const handleRounds = () => {
  roundCounter += 1
  if (roundCounter > options.totalRounds) {
    stopGame()
    setTimeout(startGame, options.podiumDuration * 1000)
  } else {
    resetRound()
    sendMathQuestion()
  }
}

const handleIncoming = (ws, msg) => {
  const parsed = JSON.parse(msg)
  switch (parsed.type) {
    case 'answer':
      if (gameRunning && currentQuestion && !ws.answered) {
        if (parsed.answer == currentQuestion.answer) {
          handleCorrectAnswer(ws)
        } else {
          handleWrongAnswer(ws)
        }
      }
      break;
    case 'chat':
      sendChatMessage(ws, parsed.message)
      break;
  }
}

wss.on('connection', (ws) => {
  configureNewClient(ws)
  sendId(ws)
  sendPlayerData()
  ws.on('message', (msg) => handleIncoming(ws, msg))
  ws.on('close', () => {
    sendPlayerData()
  })
})

const startGame = () => {
  gameRunning = true
  sendPlayerData()
  handleRounds()
  questionTimer = setInterval(handleRounds, options.questionDuration * 1000)
}

setTimeout(startGame, options.startUpTime * 1000)


server.listen(3000, () => console.log(`Lisening on port :3000`))