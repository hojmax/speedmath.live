const getNumber = (difficulty) => {
    return 1 + Math.floor(Math.random() * 10 * difficulty)
}

const mathQuestionGenerator = (difficulty) => {
    const types = ['add', 'sub', 'mult', 'div']
    // const type = types[Math.floor(Math.random() * types.length)]
    const type = 'div'
    let answer;
    let num1;
    let num2;
    switch (type) {
        case 'add':
            num1 = getNumber(difficulty * 2)
            num2 = getNumber(difficulty * 2)
            answer = num1 + num2
            break
        case 'sub':
            num1 = getNumber(difficulty * 2)
            num2 = getNumber(difficulty * 2)
            answer = num1 - num2
            break
        case 'mult':
            num1 = getNumber(difficulty)
            num2 = getNumber(difficulty)
            answer = num1 * num2
            break
        case 'div':
            num1 = getNumber(difficulty)
            num2 = getNumber(difficulty)
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