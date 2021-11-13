const express = require('express')
const app = express()
const server = require('http').createServer(app)
const nameGenerator = require('./nameGenerator.js')
const mathQuestionGenerator = require('./math.js')
const WebSocket = require('ws')
const { v4: uuidv4 } = require('uuid')
const websocket = new WebSocket.Server({ server: server })
const options = require('./options.json')
let roundInterval
let roundCounter = 0
let currentQuestion
let startOfRound

const sendJSON = (client, data) => {
  if (options.isDebugging) debuggingLog(client, data, incoming = false)
  client.send(JSON.stringify(data))
}

const sendToAll = (data) => {
  websocket.clients.forEach((client) => {
    if (client.readyState !== WebSocket.OPEN) return
    sendJSON(client, data)
  })
}

const configureNewClient = (client) => {
  client.id = uuidv4()
  client.name = nameGenerator()
  client.score = 0
  client.answered = false
  client.correctRounds = 0
  client.deltaScore = 0
  client.messageCount = 0
}

const sendPlayerData = () => {
  const allPlayerData = [...websocket.clients.values()].map(e => {
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

const setForAll = (parameters) => {
  websocket.clients.forEach((client) => {
    if (client.readyState !== WebSocket.OPEN) return
    Object.entries(parameters).forEach(entry => {
      client[entry[0]] = entry[1]
    })
  })
}

const resetGame = () => {
  setForAll({
    answered: false,
    deltaScore: 0,
    score: 0,
    correctRounds: 0,
    messageCount: 0,
  })
}

const resetRound = () => {
  setForAll({
    answered: false,
    deltaScore: 0,
    messageCount: 0,
  })
}

const sendQuestion = () => {
  startOfRound = Date.now()
  currentQuestion = mathQuestionGenerator()
  sendToAll({
    type: 'question',
    data: {
      num1: currentQuestion.num1,
      num2: currentQuestion.num2,
      type: currentQuestion.type,
      time: options.duration.round,
      round: roundCounter,
      totalRounds: options.totalRounds,
    }
  })
}

const sendPodium = () => {
  const allPlayerData = [...websocket.clients.values()].map(e => {
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
      time: options.duration.podium,
      totalRounds: options.totalRounds,
    },
  })
}

const sendId = (client) => {
  sendJSON(client, {
    type: 'id',
    data: {
      id: client.id
    }
  })
}

const calculateScore = () => {
  return Math.round((options.score.max - options.score.min) * (1 - (Date.now() - startOfRound) / (options.duration.round * 1000))) + options.score.min
}

const sendChatMessage = (client, msg) => {
  sendToAll({
    type: 'chat',
    data: {
      time: Date.now(),
      name: client.name,
      message: msg
    },
  })
}

const handleCorrectAnswer = (client) => {
  client.correctRounds++
  client.answered = true
  client.deltaScore = calculateScore()
  client.score += client.deltaScore
  sendJSON(client, {
    type: 'answer',
    data: {
      correct: true
    }
  })
  sendPlayerData()
}

const handleWrongAnswer = (client) => {
  sendJSON(client, {
    type: 'answer',
    data: {
      correct: false
    }
  })
}

const stopGame = () => {
  clearInterval(roundInterval)
  roundCounter = 0
  sendPodium()
  resetGame()
}

const handleRounds = () => {
  roundCounter++
  if (roundCounter > options.totalRounds) {
    stopGame()
    setTimeout(startGame, options.duration.podium * 1000)
  } else {
    resetRound()
    sendQuestion()
  }
}

const sendPong = (client) => {
  sendJSON(client, { type: 'pong' })
}

const handleRateLimiting = (client) => {
  if (++client.messageCount > options.rateLimit) {
    sendJSON(client, {
      type: 'rate-limit-kick'
    })
    client.close()
    return true
  }
  return false
}

const debuggingLog = (client, data, incoming) => {
  console.log(`[${incoming ? 'IN' : 'OUT'}], ${client.name}, ${data.type.toUpperCase()} ${data.data ? JSON.stringify(data.data) : ''}`)
}

const handleIncoming = (client, msg) => {
  const isKicked = handleRateLimiting(client)
  if (isKicked) return

  const parsed = JSON.parse(msg)
  if (options.isDebugging) debuggingLog(client, parsed, incoming = true)

  switch (parsed.type) {
    case 'answer':
      if (!currentQuestion || client.answered) return
      if (parsed.answer == currentQuestion.answer) return handleCorrectAnswer(client)
      return handleWrongAnswer(client)
    case 'chat': return sendChatMessage(client, parsed.message)
    case 'ping': return sendPong(client)
    default: throw new Error(`Unhandled Message: ${msg} `)
  }
}

websocket.on('connection', (client) => {
  configureNewClient(client)
  sendId(client)
  sendPlayerData()
  client.on('message', (msg) => handleIncoming(client, msg))
  client.on('close', () => {
    sendPlayerData()
  })
})

const startGame = () => {
  sendPlayerData()
  handleRounds()
  roundInterval = setInterval(handleRounds, options.duration.round * 1000)
}

setTimeout(startGame, options.duration.startup * 1000)

app.use(express.static('public'))

server.listen(3000, () => console.log(`Lisening on port: 3000`))