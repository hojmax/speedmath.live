const socket = new WebSocket('ws://localhost:3000');

socket.addEventListener('open', (event) => {
    console.log('Connected to WS Server')
});

socket.addEventListener('message', (event) => {
    const resp = JSON.parse(event.data)
    if (resp.type === 'playerData') {
        // Clear Table
        updateTable(resp)
    } else if (resp.type === 'mathQuestion') {
        updateQuestion(resp)
    }
});
