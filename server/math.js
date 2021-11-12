const options = require('./options.json');

const getNumber = (type) => {
    const min = options.number[type].min
    const max = options.number[type].max
    return min + Math.floor((max - min + 1) * Math.random())
}

const mathQuestionGenerator = () => {
    const types = ['mult', 'add', 'sub', 'div']
    const type = types[Math.floor(Math.random() * types.length)]
    let answer;
    let num1;
    let num2;
    switch (type) {
        case 'add':
            num1 = getNumber('larger')
            num2 = getNumber('larger')
            answer = num1 + num2
            break
        case 'sub':
            num1 = getNumber('larger')
            num2 = getNumber('larger')
            answer = num1 - num2
            break
        case 'mult':
            num1 = getNumber('smaller')
            num2 = getNumber('smaller')
            answer = num1 * num2
            break
        case 'div':
            num1 = getNumber('smaller')
            num2 = getNumber('smaller')
            answer = num1
            num1 *= num2
            break
    }
    return {
        num1: num1,
        num2: num2,
        type: type,
        answer: answer,
    }
}

module.exports = mathQuestionGenerator