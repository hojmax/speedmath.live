const addRow = (user, score, deltaScore, index, isClient) => {
    const element = document.getElementById('player-table').children[0]
    var row = document.createElement('tr')
    var col0 = document.createElement('td')
    var col1 = document.createElement('td')
    var col2 = document.createElement('td')
    if (isClient) {
        var caret = document.createElement('i')
        caret.className = 'fas fa-angle-double-right'
        caret.id = 'client-indicator'
        col1.append(caret)
    }
    col0.append(`${index + 1}.`)
    col1.append((isClient ? ' ' : '') + user)
    col2.append(score)
    if (deltaScore != 0) {
        var span = document.createElement('span')
        span.className = 'delta-score-span'
        span.append(` +${deltaScore}`)
        col2.append(span)
    }
    row.append(col0)
    row.append(col1)
    row.append(col2)
    element.append(row)
}

const clearTable = () => {
    const element = document.getElementById('player-table').children[0]
    while (element.childNodes.length > 1) {
        element.removeChild(element.lastChild)
    }
}

const animateTable = () => {
    const element = document.getElementById('player-table')
    element.style.animation = 'none'
    element.offsetHeight
    element.style.animation = `shake 0.5s ease`
}

const updateTable = (players) => {
    clearTable()
    for (let i = 0; i < players.length; i++) {
        const e = players[i]
        addRow(e.name, e.score, e.deltaScore, i, id === e.id)
    }
}

const updatePlayerCount = (players) => {
    document.getElementById('player-count').innerText = `Players Online: ${players.length}`
}

const questionDOM = (question) => {
    const element = document.getElementById('question')
    element.innerHTML = ''
    element.append('What does ')
    var span = document.createElement('span')
    span.id = 'question-span'
    span.append(question)
    element.append(span)
    element.append(' equal?')
}

const updateRoundCounter = (data) => {
    const element = document.getElementById('round-counter')
    element.style.display = 'block'
    element.innerText = `Round ${data.round}/${data.totalRounds}`
}

const switchPodiumAndGame = (data) => {
    document.getElementById('round-counter').style.display = 'block'
    document.getElementById('round-counter').innerText = `Podium`
    document.getElementById('podium-container').style.display = 'flex'
    document.getElementById('game-container').style.display = 'none'
    setTimeout(() => {
        document.getElementById('podium-container').style.display = 'none'
        document.getElementById('game-container').style.display = 'flex'
    }, data.time * 1000)
    setTimeout(fireConfetti, 2000)
}

const populatePodium = (data) => {
    const ids = ['first-place', 'second-place', 'third-place']
    for (let i = 0; i < data.players.length; i++) {
        const player = data.players[i]
        document.getElementById(ids[i]).children[1].innerText = player.name
        document.getElementById(ids[i]).children[2].innerHTML = `<strong>${player.score}</strong> points`
        document.getElementById(ids[i]).children[3].innerText = `${player.correctRounds} out of ${data.totalRounds}`
    }
}

const handlePodium = (data) => {
    setTimer(data)
    populatePodium(data)
    switchPodiumAndGame(data)
}

const serverErrorDOM = (error) => {
    const element = document.getElementById('question')
    element.innerText = 'Connection lost... Reload or try again later.'
}

const fireConfetti = () => {
    var rect = document.getElementById("first-place").getBoundingClientRect();
    confetti({
        particleCount: 100,
        startVelocity: 25,
        spread: 360,
        zIndex: 0,
        origin: {
            y: (rect.top - (rect.top - rect.bottom) / 2) / window.innerHeight,
            x: (rect.left - (rect.left - rect.right) / 2) / window.innerWidth
        }
    })
}

const setTimer = (data) => {
    document.getElementById('loading-bar-container').style.display = 'block'
    const element = document.getElementById('loading-bar')
    element.style.animation = 'none'
    element.offsetHeight
    element.style.animation = `slide ${data.time}s linear`
}

const handleIncorrect = () => {
    const element = document.getElementById('input')
    element.style.animation = 'none'
    element.offsetHeight
    element.style.animation = 'incorrect 0.5s ease'
}

const handleCorrect = () => {
    const element = document.getElementById('input')
    element.style.animation = 'none'
    element.offsetHeight
    element.style.animation = 'correct 0.5s ease'
    element.value = ''
}

const handleAnswer = (data) => {
    if (data.correct) {
        handleCorrect()
    } else {
        handleIncorrect()
    }
}

const handleChat = (data) => {
    const date = new Date(data.time)
    const dateString = date.toTimeString().split(' ')[0]
    const element = document.getElementById('scroll-container')
    const messageContainer = document.createElement('div')
    messageContainer.className = "message-container"
    // Time
    const messageTime = document.createElement('div')
    messageTime.className = "message-time"
    messageTime.append(dateString)
    messageContainer.append(messageTime)
    // Name
    const messageSender = document.createElement('div')
    messageSender.className = "message-sender"
    messageSender.append(`${data.name}:`)
    messageContainer.append(messageSender)
    // Content
    const messageContent = document.createElement('div')
    messageContent.className = "message-content"
    messageContent.append(data.message)
    messageContainer.append(messageContent)
    element.append(messageContainer)
    var scrollDiv = document.getElementById("scroll-container");
    scrollDiv.scrollTop = scrollDiv.scrollHeight;
}

const updateQuestion = (data) => {
    if (data.type === 'add') {
        questionDOM(`${data.num1} + ${data.num2}`)
    } else if (data.type === 'sub') {
        questionDOM(`${data.num1} - ${data.num2}`)
    } else if (data.type === 'mult') {
        questionDOM(`${data.num1} × ${data.num2}`)
    } else if (data.type === 'div') {
        questionDOM(`${data.num1} / ${data.num2}`)
    }
}

const startEventListernes = () => {
    document.getElementById('input').addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && event.target.value) {
            sendAnswer(event.target.value)
        }
    })
    document.getElementById('chat-input').addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && event.target.value) {
            sendChatMessage(event.target.value)
            event.target.value = ''
        }
    })
}

startEventListernes()