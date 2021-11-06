const addRow = (user, score, deltaScore, isClient) => {
    const element = document.getElementById('player-table').children[0]
    var row = document.createElement('TR')
    var col1 = document.createElement('TD')
    var col2 = document.createElement('TD')
    if (isClient) {
        var caret = document.createElement('I')
        caret.className = 'fas fa-angle-double-right'
        caret.id = 'client-indicator'
        col1.appendChild(caret)
    }
    col1.appendChild(document.createTextNode((isClient ? ' ' : '') + user))
    col2.appendChild(document.createTextNode(score))
    if (deltaScore != 0) {
        var span = document.createElement('SPAN')
        span.className = 'delta-score-span'
        span.appendChild(document.createTextNode(` +${deltaScore}`))
        col2.appendChild(span)
    }
    row.appendChild(col1)
    row.appendChild(col2)
    element.appendChild(row)
}

const clearTable = () => {
    const element = document.getElementById('player-table').children[0]
    while (element.childNodes.length > 1) {
        element.removeChild(element.lastChild)
    }
}

const updateTable = (players) => {
    clearTable()
    for (const e of players) {
        addRow(e.name, e.score, e.deltaScore, id === e.id)
    }
}

const updatePlayerCount = (players) => {
    document.getElementById('player-count').innerHTML = `Players Online: ${players.length}`
}

const questionDOM = (question) => {
    const element = document.getElementById('question')
    element.innerHTML = ''
    element.appendChild(document.createTextNode('What does '))
    var span = document.createElement('SPAN')
    span.id = 'question-span'
    span.appendChild(document.createTextNode(question))
    element.appendChild(span)
    element.appendChild(document.createTextNode(' equal?'))
}

const setTimer = (data) => {
    const element = document.getElementById('loading-bar')
    element.style.animation = 'none'
    element.offsetHeight
    element.style.animation = `slide ${data.time}s linear`
}

const handleAnswer = (data) => {
    const element = document.getElementById('input')
    answered = true
    if (data.correct) {
        element.value = ''
    } else {
        element.style.animation = 'none'
        element.offsetHeight
        element.style.animation = 'incorrect 0.5s ease'
    }
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

document.getElementById('input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendAnswer(event.target.value)
    }
})