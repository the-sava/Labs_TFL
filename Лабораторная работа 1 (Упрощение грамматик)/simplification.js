const path = require('path')
const fs = require('fs')

class Grammar {

    constructor(name, fileName) {

        this.name = name
        this.fileName = fileName
        this.regexpForNonTerminals = /nonterminals=([A-z],)*[A-z]/g
        this.regexpForTerminals = /terminals=([A-z],)*[A-z]/g
        this.nonTerminals = []
        this.terminals = []
        this.rules = []
        this.structure = []
        this.parseFile()
        this.checkGrammar()
    }

    parseFile() {
        this.lines = fs.readFileSync(path.join(__dirname, this.fileName), 'utf8')
                    .split('\n')
                    .map((line) => {
                        return line.replace(/ /g, '').replace('\r', '')
                    })
        for (let lineIndex in this.lines) {
            switch (lineIndex) {
                case '0': {
                    let nonTerminalsError = new Error('Неккоретный формат ввода нетерминалов')
                    if (this.lines[lineIndex].match(this.regexpForNonTerminals)) {
                        if (this.lines[lineIndex].match(this.regexpForNonTerminals)[0] !== this.lines[lineIndex]) throw nonTerminalsError
                        this.nonTerminals = this.lines[lineIndex].replace('nonterminals=', '').split(',').map((nonTerminal) => nonTerminal)
                    } else throw nonTerminalsError
                    break
                }
                case '1': {
                    let terminalsError = new Error('Неккоретный формат ввода терминалов')
                    if (this.lines[lineIndex].match(this.regexpForTerminals)) {
                        if (this.lines[lineIndex].match(this.regexpForTerminals)[0] !== this.lines[lineIndex]) throw terminalsError
                        this.terminals = this.lines[lineIndex].replace('terminals=', '').split(',').map((terminal) => terminal)
                    } else throw terminalsError
                    break
                }
                default: {
                    let full = this.lines[lineIndex]
                    let [leftSide, rightSide] = this.lines[lineIndex].split('->')
                    this.rules.push({leftSide, rightSide, full})
                    break
                }

            }
        }
    }

    checkGrammar() {
        this.nonTerminals.map((nonTerminal) => {
            this.terminals.map((terminal) => {
                if (nonTerminal === terminal) throw Error(`Множества нетерминалов и терминалов не могут пересекаться (Пересечение: ${nonTerminal})`)
            })
        })
        this.rules.map((rule) => {
            if (this.nonTerminals.indexOf(rule.leftSide) === -1) throw Error(`Некорректный формат ввода правила: ${rule.full} (В левой части правила может стоять только нетерминал)`)
        })
    }

    buildStructure() {
        this.rules.map((rule) => {
            let result = this.structure.find((s) => s.nonTerminal === rule.leftSide)
            if (result) this.structure.push({nonTerminal: rule.leftSide, rightSides:[rule.rightSide]})
            else {
                for (let structure )
            }

        })
    }

    print() {
        console.log(`Имя грамматики: ${this.name}`)
        console.log(`Файл грамматики: ${this.fileName}`)
        console.log(`Нетерминалы: ${this.nonTerminals.join(',')}`)
        console.log(`Терминалы: ${this.terminals.join(',')}`)
        console.log(`Правила: \n${this.rules.map((rule) => rule.full).join('\n')}`)
        // console.log(`Структура:\n ${this.structure.map((s) => s.)}`)
    }
}

let G1 = new Grammar('G1', 'G1.txt')
G1.print() 