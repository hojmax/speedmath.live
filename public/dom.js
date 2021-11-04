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

const updateQuestion = (resp) => {
    const element = document.getElementById('question')
    element.innerHTML = ''
    let questionString;
    if (resp.data.type === 'add') {
        questionString = `What does ${resp.data.num1} + ${resp.data.num2} equal?`
    } else if (resp.data.type === 'sub') {
        questionString = `What does ${resp.data.num1} - ${resp.data.num2} equal?`
        element.innerHTML = 'sub'
    } else if (resp.data.type === 'mult') {
        questionString = `What does ${resp.data.num1} * ${resp.data.num2} equal?`
        element.innerHTML = 'mult'
    } else if (resp.data.type === 'div') {
        questionString = `Whats does ${resp.data.num1} / ${resp.data.num2} equal?`
    }
    element.innerHTML = questionString
}