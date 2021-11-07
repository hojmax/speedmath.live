const express = require('express')
const app = express()
const server = require('http').createServer(app)
const nameGenerator = require('./nameGenerator.js')
const mathQuestionGenerator = require('./math.js')
const WebSocket = require('ws')
const { v4: uuidv4 } = require('uuid')
const wss = new WebSocket.Server({ server: server })
const difficulty = 2
const questionDuration = 5
const podiumDuration = 10
const totalRounds = 3
const startUpTime = 3
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
  currentQuestion = mathQuestionGenerator(difficulty)
  sendToAll({
    type: 'mathQuestion',
    data: {
      num1: currentQuestion.num1,
      num2: currentQuestion.num2,
      type: currentQuestion.type,
      time: questionDuration,
      round: roundCounter,
      totalRounds: totalRounds,
    }
  })
}

const sendPodium = () => {
  const allPlayerData = [...wss.clients.values()].map(e => {
    return {
      id: e.id,
      name: e.name,
      score: e.score,
    }
  })
  allPlayerData.sort((a, b) => b.score - a.score)
  const podium = allPlayerData.splice(0, 3)
  sendToAll({
    type: 'podium',
    data: {
      players: podium,
      time: podiumDuration
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

const handleCorrectAnswer = (ws) => {
  ws.answered = true
  ws.deltaScore = Math.ceil(1000 - (Date.now() - questionTime) / questionDuration)
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
  if (roundCounter > totalRounds) {
    stopGame()
    setTimeout(startGame, podiumDuration * 1000)
  } else {
    resetRound()
    sendMathQuestion()
  }
}

const handleAnswers = (ws, msg) => {
  if (gameRunning && currentQuestion && !ws.answered) {
    const parsed = JSON.parse(msg)
    if (parsed.answer == currentQuestion.answer) {
      handleCorrectAnswer(ws)
    } else {
      handleWrongAnswer(ws)
    }
  }
}

wss.on('connection', (ws) => {
  configureNewClient(ws)
  sendId(ws)
  sendPlayerData()
  ws.on('message', (msg) => handleAnswers(ws, msg))
  ws.on('close', () => {
    sendPlayerData()
  })
})

const startGame = () => {
  gameRunning = true
  sendPlayerData()
  handleRounds()
  questionTimer = setInterval(handleRounds, questionDuration * 1000)
}

setTimeout(startGame, startUpTime * 1000)


server.listen(3000, () => console.log(`Lisening on port :3000`))