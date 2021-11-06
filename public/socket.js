const socket = new WebSocket('ws://localhost:3000');
let id;

const tryAnswer = (answer) => {
    socket.send(JSON.stringify({
        type: 'answer',
        answer: answer
    }))
}

socket.addEventListener('message', (event) => {
    const resp = JSON.parse(event.data)
    switch (resp.type) {
        case 'playerData':
            updateTable(resp.data)
            updatePlayerCount(resp.data)
            break;
        case 'mathQuestion':
            setTimer(resp.data)
            updateQuestion(resp.data)
            break;
        case 'id':
            id = resp.data.id
            break;
        case 'answer':
            console.log(resp.data)
            break;
    }
});
