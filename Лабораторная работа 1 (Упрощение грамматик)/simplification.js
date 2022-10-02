const path = require('path')
const fs = require('fs')

class Grammar {

    constructor(name, fileName) {
        this.name = name
        this.fileName = this.fileName
        this.regexpForNonTerminals = /nonterminals=([A-z],)*[A-z]/g
        this.regexpForTerminals = /terminals=([A-z],)*[A-z]/g
        this.nonTerminals = []
        this.terminals = []
    }

    parseFile() {
        this.lines = fs.readFileSync(path.join(__dirname, this.fileName), 'utf-8')
                    .split('\n')
                    .map((line) => {
                        return line.toLowerCase().replace(' ', '').replace('\r', '')
                    })
        for (let lineIndex in this.lines) {
            switch (lineIndex) {
                case 0: {
                    let nonTerminalsError = new Error('Неккоретный формат ввода нетерминалов')
                    if (this.lines[lineIndex].match(this.regexpForNonTerminals)) {
                        if (this.lines[lineIndex].match(this.regexpForNonTerminals)[0] !== this.lines[lineIndex]) throw nonTerminalsError
                        this.lines[lineIndex].replace('nonterminals=', '').split(',').map((nonTerminal) => {this.nonTerminals.push(nonTerminal)})
                    } else throw nonTerminalsError
                    break
                }
                case 1: {
                    let terminalsError = new Error('Неккоретный формат ввода терминалов')
                    if (this.lines[lineIndex].match(this.regexpForTerminals)) {
                        if (this.lines[lineIndex].match(this.regexpForTerminals)[0] !== this.lines[lineIndex]) throw terminalsError
                        this.lines[lineIndex].replace('terminals=', '').split(',').map((terminal) => {this.terminals.push(terminal)})
                    } else throw terminalsError
                    break
                }

            }
        }
    }

    print() {
        console.log(`Имя грамматики: ${this.name}`)
        console.log(`Файл грамматики: ${this.fileName}`)
        console.log(`Нетерминалы: ${this.nonTerminals.join(',')}`)
        console.log(`Терминалы: ${this.terminals.join(',')}`)
    }
}

let G1 = new Grammar('G1', 'G1.txt')
G1.print()