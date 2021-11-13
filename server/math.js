const options = require('./options.json')

const getNumber = (type) => {
    const min = options.number[type].min
    const max = options.number[type].max
    return min + Math.floor((max - min + 1) * Math.random())
}

const mathQuestionGenerator = () => {
    const types = ['mult', 'add', 'sub', 'div', 'pow']
    const type = types[Math.floor(Math.random() * types.length)]
    let answer
    let num1
    let num2
    switch (type) {
        case 'add':
            num1 = getNumber('large')
            num2 = getNumber('large')
            answer = num1 + num2
            break
        case 'sub':
            num1 = getNumber('large')
            num2 = getNumber('large')
            answer = num1 - num2
            break
        case 'mult':
            num1 = getNumber('small')
            do { num2 = getNumber('small') } while (num1 === num2)
            answer = num1 * num2
            break
        case 'div':
            num1 = getNumber('small')
            num2 = getNumber('small')
            answer = num1
            num1 *= num2
            break
        case 'pow':
            num1 = getNumber('medium')
            answer = num1 * num1
    }
    return {
        num1: num1,
        num2: num2,
        type: type,
        answer: answer,
    }
}

module.exports = mathQuestionGenerator