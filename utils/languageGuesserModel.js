const { Language } = require('node-nlp')

const text = 'Hola, mi nombre es Jim, soy de Modesto California.'

const language = new Language()


const guessLanguage = (text) => {
    const guess = language.guessBest(text, ['en', 'es'])
    return guess   
}

// console.log(guessLanguage(text))

module.exports = guessLanguage