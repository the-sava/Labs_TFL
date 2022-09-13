const fs = require('fs')
const path = require('path')

class TRS {

    constructor(fileName) {
        this.fileName = fileName
        this.fileData = null
        this.fileLines = []
        this.regexpForType = /lexicographic|anti-lexicographic/
        this.regexpForConstructors = /constructors=([a-z]\([0-2]\),)*([a-z]\([0-2]\))/
        this.regexpForConstructor = /[a-z]\([0-2]\)/g
        this.regexpForVariables = /variables=([a-z],)*[a-z]/
        this.regexpForVariable = /[a-z]/g
        this.isCorrectSyntax = true
        this.variables = []
        this.constructors = []
        this.parseFile(fileName)
        this.checkInputFile()
    }

    parseFile(fileName) {
        this.fileData = fs.readFileSync(fileName, 'utf-8')
        this.fileLines = fs.readFileSync(fileName, 'utf-8').
        split('\n').
        map( (line) => {
            return line.replace('\r', '').replace(/ /g, '').toLowerCase()
        })
    }

    checkInputFile() {
        this.fileLines.map( (line, index) => {
            switch (index) {
                case 0:
                    let errorOfType = new Error('Ошибка типа алгоритма в строке: ' + line)
                    if (line.match(this.regexpForType)) {
                        if (line.match(this.regexpForType)[0] !== line) throw errorOfType
                    } else throw errorOfType

                    break
                case 1: {
                    let errorOfСonstructors = new Error('Ошибка синтаксиса списка конструкторов строке: ' + line)
                    if (line.match(this.regexpForConstructors)) {
                        if (line.match(this.regexpForConstructors)[0] !== line) throw errorOfСonstructors
                    } else throw errorOfСonstructors
                    this.constructors = line.replace('constructors=', '').match(this.regexpForConstructor).map((constructor)=>{})
                    break
                }
                case 2: {
                    let errorOfVariables = new Error('Ошибка синтаксиса списка переменных строке: ' + line)
                    if (line.match(this.regexpForVariables)) {
                        if (line.match(this.regexpForVariables)[0] !== line) throw errorOfVariables
                    } else throw errorOfVariables
                    this.variables = line.replace('variables=', '').match(this.regexpForVariable)
                    break
                }
            }

        })
    }

    print() {
        console.log(this.fileLines)
    }
}

let TRS1 = new TRS('input.txt')
TRS1.print()
console.log(TRS1.isCorrectSyntax)
console.log(TRS1.fileLines[1].match(TRS1.regexpForConstructor))

