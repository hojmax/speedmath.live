const socket = new WebSocket('ws://localhost:3000');
let id;
let playerData;

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
            break;
        case 'mathQuestion':
            setTimer(resp.data)
            updateQuestion(resp.data)
            updateRoundCounter(resp.data)
            resetDeltaScore(playerData)
            updateTable(playerData)
            break;
        case 'id':
            id = resp.data.id
            break;
        case 'answer':
            handleAnswer(resp.data)
            break;
        case 'podium':
            handlePodium(resp.data)
            break;
        case 'chat':
            handleChat(resp.data)
            break;
        default:
            console.log('Unhandled response', resp)
            break;
    }
}
const resetDeltaScore = (data) => {
    for (const e of data) {
        e.deltaScore = 0
    }
}

const sendAnswer = (answer) => {
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

socket.addEventListener('error', serverErrorDOM)


socket.addEventListener('message', handleMessage);
