const socket = new WebSocket('ws://localhost:3000')
let id
let playerData
let answered = false
let recievedPong = true
let pingInterval;

const handleMessage = (msg) => {
    const resp = JSON.parse(msg.data)
    switch (resp.type) {
        case 'playerData':
            if (playerData) {
                animateTable()
            }
            playerData = resp.data
            updateTable(playerData)
            updatePlayerCount(playerData)
            break
        case 'mathQuestion':
            answered = false
            setTimer(resp.data)
            updateQuestion(resp.data)
            updateRoundCounter(resp.data)
            resetDeltaScore(playerData)
            updateTable(playerData)
            break
        case 'id':
            id = resp.data.id
            break
        case 'answer':
            handleAnswer(resp.data)
            break
        case 'podium':
            handlePodium(resp.data)
            break
        case 'chat':
            chatMessage(resp.data)
            break
        case 'pong':
            recievedPong = true
            break
        case 'rate-limit-kick':
            messageToUser('You have been disconnected for sending too many requests.')
            break
        default:
            throw new Error('Unhandled Message')
    }
}

const resetDeltaScore = (data) => {
    for (const e of data) {
        e.deltaScore = 0
    }
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