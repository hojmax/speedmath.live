const socket = new WebSocket('ws://localhost:3000');
let id;
let answered = false;
let playerData;

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

socket.addEventListener('message', (event) => {
    const resp = JSON.parse(event.data)
    switch (resp.type) {
        case 'playerData':
            playerData = resp.data
            updateTable(playerData)
            updatePlayerCount(playerData)
            break;
        case 'mathQuestion':
            setTimer(resp.data)
            updateQuestion(resp.data)
            resetDeltaScore(playerData)
            updateTable(playerData)
            break;
        case 'id':
            id = resp.data.id
            break;
        case 'answer':
            handleAnswer(resp.data)
            break;
        default:
            console.log('Unhandled response', resp)
            break;
    }
});
