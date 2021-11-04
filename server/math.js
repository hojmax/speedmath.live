const mathQuestionGenerator = () => {
    const types = ['add', 'sub', 'mult', 'div']
    const type = types[Math.floor(Math.random() * types.length)]
    const difficulty = 1
    let num1 = 1 + Math.floor(Math.random() * Math.pow(10, difficulty))
    let num2 = 1 + Math.floor(Math.random() * Math.pow(10, difficulty))
    let answer;
    if (type === 'add') {
        answer = num1 + num2
    } else if (type === 'sub') {
        answer = num1 - num2
    } else if (type === 'mult') {
        answer = num1 * num2
    } else if (type === 'div') {
        answer = num1
        num1 = num1 * num2
    }
    return {
        num1: num1,
        num2: num2,
        type: type,
        answer: answer,
    }
}

module.exports = mathQuestionGenerator