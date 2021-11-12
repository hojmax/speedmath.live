const express = require('express')
const app = express()
const server = require('http').createServer(app)
const nameGenerator = require('./nameGenerator.js')
const mathQuestionGenerator = require('./math.js')
const WebSocket = require('ws')
const { v4: uuidv4 } = require('uuid')
const wss = new WebSocket.Server({ server: server })
const options = require('./options.json')
let questionTimer
let roundCounter = 0
let currentQuestion
let questionTime

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
  ws.messageCount = 0
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
      client.messageCount = 0
    }
  })
}

const resetRound = () => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.answered = false
      client.deltaScore = 0
      client.messageCount = 0
    }
  })
}

const sendMathQuestion = () => {
  questionTime = Date.now()
  currentQuestion = mathQuestionGenerator()
  sendToAll({
    type: 'mathQuestion',
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
      time: options.duration.podium,
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
  return Math.round((options.score.max - options.score.min) * (1 - (Date.now() - questionTime) / (options.duration.round * 1000))) + options.score.min
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
  ws.correctRounds++
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
  clearInterval(questionTimer)
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
    sendMathQuestion()
  }
}

const sendPong = (ws) => {
  ws.send(JSON.stringify({ type: 'pong' }))
}

const currentTimeString = () => {
  return (new Date).toTimeString().split(' ')[0]
}

const handleRateLimiting = (ws) => {
  if (++ws.messageCount > options.rateLimit) {
    ws.send(JSON.stringify({
      type: 'rate-limit-kick'
    }))
    ws.close()
    return true
  }
  return false
}

const handleIncoming = (ws, msg) => {
  const isKicked = handleRateLimiting(ws)
  if (isKicked) return

  const parsed = JSON.parse(msg)
  if (options.isDebugging) {
    console.log(currentTimeString(), ws.name, parsed)
  }
  switch (parsed.type) {
    case 'answer':
      if (currentQuestion && !ws.answered) {
        if (parsed.answer == currentQuestion.answer) {
          handleCorrectAnswer(ws)
        } else {
          handleWrongAnswer(ws)
        }
      }
      break
    case 'chat':
      sendChatMessage(ws, parsed.message)
      break
    case 'ping':
      sendPong(ws)
      break
    default:
      throw new Error('Unhandled Message')
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
  sendPlayerData()
  handleRounds()
  questionTimer = setInterval(handleRounds, options.duration.round * 1000)
}

setTimeout(startGame, options.duration.startup * 1000)

app.use(express.static('public'))

server.listen(3000, () => console.log(`Lisening on port :3000`))