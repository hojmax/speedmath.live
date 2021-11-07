const socket = new WebSocket('ws://localhost:3000');
let id;
let playerData;
let podiumTemplate = {
    players: [
        { id: "33419d56-1793-4e41-8505-7c18ec608382", name: "CalmShark", score: 1098 },
        { id: "4b5055d5-3980-405c-91f7-89cbc4940f95", name: "GracefulBadger", score: 543 },
        { id: "4b1235d5-3980-405c-91f7-89cbc4123015", name: "FunnyBeaver", score: 101 }
    ], time: 10
}

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

socket.addEventListener('error', serverErrorDOM)


socket.addEventListener('message', handleMessage);
