const addRow = (user, score, header = false) => {
    const element = document.getElementById('player-table').children[0]
    var row = document.createElement('TR')
    var col1 = document.createElement(header ? 'TH' : 'TD')
    var col2 = document.createElement(header ? 'TH' : 'TD')
    col1.appendChild(document.createTextNode(user))
    col2.appendChild(document.createTextNode(score))
    row.appendChild(col1)
    row.appendChild(col2)
    element.appendChild(row)
}

const clearTable = () => document.getElementById('player-table').children[0].innerHTML = ''

const updateTable = (resp) => {
    clearTable()
    addRow('User', 'Score', header = true)
    for (const e of resp.data) {
        addRow(e.name, e.score)
    }
}

const updatePlayerCount = (resp) => {
    document.getElementById('player-count').innerHTML = `Players Online: ${resp.data.length}`
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

const updateQuestion = (resp) => {
    if (resp.data.type === 'add') {
        questionDOM(`${resp.data.num1} + ${resp.data.num2}`)
    } else if (resp.data.type === 'sub') {
        questionDOM(`${resp.data.num1} - ${resp.data.num2}`)
        element.innerHTML = 'sub'
    } else if (resp.data.type === 'mult') {
        questionDOM(`${resp.data.num1} * ${resp.data.num2}`)
        element.innerHTML = 'mult'
    } else if (resp.data.type === 'div') {
        questionDOM(`${resp.data.num1} / ${resp.data.num2}`)
    }
}