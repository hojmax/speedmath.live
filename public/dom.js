const addRow = (user, score, deltaScore, index, isClient) => {
    const element = document.getElementById('player-table').children[0]
    const row = document.createElement('tr')
    const col0 = document.createElement('td')
    const col1 = document.createElement('td')
    const col2 = document.createElement('td')
    if (isClient) {
        const caret = document.createElement('i')
        caret.className = 'fas fa-angle-double-right'
        caret.id = 'client-indicator'
        col1.append(caret)
    }
    col0.append(`${index + 1}.`)
    col1.append((isClient ? ' ' : '') + user)
    col2.append(score)
    if (deltaScore != 0) {
        const span = document.createElement('span')
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

const tripleDotRow = () => {
    const element = document.getElementById('player-table').children[0]
    const row = document.createElement('tr')
    const col = document.createElement('td')
    col.innerText = '...'
    row.append(document.createElement('td'))
    row.append(col)
    row.append(document.createElement('td'))
    element.append(row)
}

const updateTable = (players) => {
    const maxPlayersShown = 6
    const clientIndex = players.findIndex(e => e.id === id)
    const isShown = clientIndex < maxPlayersShown
    const limit = Math.min(players.length, isShown ? maxPlayersShown : maxPlayersShown - 1)
    clearTable()
    for (let i = 0; i < limit; i++) {
        const e = players[i]
        addRow(e.name, e.score, e.deltaScore, i, id === e.id)
    }
    if (players.length > maxPlayersShown) tripleDotRow()
    if (isShown) return
    const e = players[clientIndex]
    addRow(e.name, e.score, e.deltaScore, clientIndex, id === e.id)
}

const updatePlayerCount = (players) => {
    document.getElementById('player-count').innerText = `Players Online: ${players.length}`
}

const updateQuestionDOM = (question) => {
    const element = document.getElementById('question')
    element.innerHTML = ''
    element.append('What does ')
    const span = document.createElement('span')
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
    document.getElementById('input').value = ''
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

const clearPodium = () => {
    const ids = ['first-place', 'second-place', 'third-place']
    ids.forEach((id) => {
        document.getElementById(id).children[1].innerHTML = ''
        document.getElementById(id).children[2].innerHTML = ''
        document.getElementById(id).children[3].innerHTML = ''
    })
}

const populatePodium = (data) => {
    const ids = ['first-place', 'second-place', 'third-place']
    data.players.forEach((player, i) => {
        document.getElementById(ids[i]).children[1].innerText = player.name
        document.getElementById(ids[i]).children[2].innerHTML = `<strong>${player.score}</strong> points`
        document.getElementById(ids[i]).children[3].innerText = `${player.correctRounds} out of ${data.totalRounds}`
    })
}

const handlePodium = (data) => {
    setTimer(data)
    clearPodium()
    populatePodium(data)
    switchPodiumAndGame(data)
}


const fireConfetti = () => {
    const rect = document.getElementById('first-place').getBoundingClientRect()
    confetti({
        particleCount: 100,
        startVelocity: 25,
        spread: 360,
        zIndex: 0,
        origin: {
            y: (rect.top + rect.bottom) / (window.innerHeight * 2),
            x: (rect.left + rect.right) / (window.innerWidth * 2)
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

const handleAnswer = (data) => {
    const element = document.getElementById('input')
    element.style.animation = 'none'
    element.offsetHeight
    element.style.animation = data.correct ? 'correct 0.5s ease' : 'incorrect 0.5s ease'
    if (!data.correct) return
    answered = true
    element.value = ''
}

const currentTimeString = () => {
    return (new Date).toTimeString().split(' ')[0]
}

const chatMessage = (data, server = false, addTime = false) => {
    const element = document.getElementById('scroll-container')
    const messageContainer = document.createElement('div')
    const serverClassName = server ? ' highlighted-chat-message' : ''
    messageContainer.className = 'message-container'
    // Time
    if (addTime) {
        const messageTime = document.createElement('div')
        messageTime.className = 'message-time' + serverClassName
        messageTime.append(currentTimeString())
        messageContainer.append(messageTime)
    }
    // Name
    const messageSender = document.createElement('div')
    messageSender.className = 'message-sender' + serverClassName
    messageSender.append(`${data.name}:`)
    messageContainer.append(messageSender)
    // Content
    const messageContent = document.createElement('div')
    messageContent.className = 'message-content' + serverClassName
    messageContent.append(data.message)
    messageContainer.append(messageContent)
    // DOM
    element.append(messageContainer)
    const scrollDiv = document.getElementById('scroll-container')
    scrollDiv.scrollTop = scrollDiv.scrollHeight
}

const updateQuestion = (data) => {
    switch (data.type) {
        case 'add': return updateQuestionDOM(`${data.num1} + ${data.num2}`)
        case 'sub': return updateQuestionDOM(`${data.num1} - ${data.num2}`)
        case 'mult': return updateQuestionDOM(`${data.num1} × ${data.num2}`)
        case 'div': return updateQuestionDOM(`${data.num1} / ${data.num2}`)
        case 'pow': return updateQuestionDOM(`${data.num1}²`)
    }
}

const setup = () => {
    document.getElementById('input').addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' || !event.target.value) return
        sendAnswer(event.target.value)
    })
    document.getElementById('chat-input').addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' || !event.target.value) return
        sendChatMessage(event.target.value)
        event.target.value = ''
    })
    document.getElementById('chat-button').addEventListener('click', (event) => {
        const element = document.getElementById('chat-input')
        if (!element.value) return
        sendChatMessage(element.value)
        element.value = ''
    })
}

setup()
