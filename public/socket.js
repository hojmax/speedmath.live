const socket = new WebSocket('ws://localhost:3000')
let id
let playerData
let answered = false
let recievedPong = true
let pingInterval

const handleMessage = (msg) => {
    const resp = JSON.parse(msg.data)
    switch (resp.type) {
        case 'playerData': return handlePlayerData(resp.data)
        case 'question': return handleQuestion(resp.data)
        case 'answer': return handleAnswer(resp.data)
        case 'podium': return handlePodium(resp.data)
        case 'chat': return chatMessage(resp.data)
        case 'id': return id = resp.data.id
        case 'pong': return recievedPong = true
        case 'rate-limit-kick': return messageToUser('You have been disconnected for sending too many requests.')
        default: throw new Error(`Unhandled Message: ${msg}`)
    }
}

const handleQuestion = (data) => {
    answered = false
    setTimer(data)
    updateQuestion(data)
    updateRoundCounter(data)
    resetDeltaScore(playerData)
    updateTable(playerData)
}

const handlePlayerData = (data) => {
    if (playerData) animateTable()
    playerData = data
    updateTable(playerData)
    updatePlayerCount(playerData)
}

const resetDeltaScore = (data) => {
    data.forEach(e => e.deltaScore = 0)
}

const sendAnswer = (answer) => {
    if (answered) return
    socket.send(JSON.stringify({
        type: 'answer',
        answer: answer
    }))
}

const sendChatMessage = (msg) => {
    socket.send(JSON.stringify({
        type: 'chat',
        message: msg
    }))
}

const messageToUser = (message) => {
    const data = {
        time: Date.now(),
        name: '[SERVER]',
        message: message
    }
    chatMessage(data, server = true)
}

const connectionError = () => {
    messageToUser('Connection lost... Reload or try again later.')
}

const startPingPong = () => {
    pingInterval = setInterval(() => {
        if (!recievedPong) {
            connectionError()
            clearInterval(pingInterval)
        } else {
            recievedPong = false
            socket.send(JSON.stringify({ type: 'ping' }))
        }
    }, 3000)
}

socket.addEventListener('error', connectionError)

socket.addEventListener('message', handleMessage)

startPingPong()