const fs = require('fs')
const path = require('path')

class Term {

    //{c: f, args: {c: g, args: x}} = {c:g, args: {c:h, args: x,x}}
    constructor(term) {
        let [leftSide, rightSide] = term.split('=')
        this.full = term
        this.leftSide = leftSide
        this.rightSide = rightSide
        this.leftSideStructure = {}
        this.rightSideStructure = {}
    }

    parse(term, key, structure) {
        if (key === term.length - 1) {
            return 0
        }
        else if (term[key] === '(') {
            structure.args = []
            this.parse(term, key + 1, structure.args)
        }
        else if (term[key] === ')') {
            this.parse(term, key + 1, structure)
        }
        else if (term[key] === ',') {
            structure.push(term[key + 1])
            this.parse(term, key + 2, structure)
        }
        else {
            structure.name = term[key]
            this.parse(term, key + 1, structure)
        }
    }

}

class TRS {

    constructor(name, fileName) {
        this.name = name
        this.fileName = fileName
        this.fileData = null
        this.fileLines = []
        this.regexpForType = /lexicographic|anti-lexicographic/
        this.regexpForConstructors = /constructors=([a-z]\(([0-9])+\),)*([a-z]\(([0-9])+\))/
        this.regexpForConstructor = /[a-z]\(([0-9])+\)/g
        this.regexpForVariables = /variables=([a-z],)*[a-z]/
        this.regexpForVariable = /[a-z]/g
        this.isCorrectSyntax = true
        this.variables = []
        this.constructors = []
        this.terms = []
        this.parseFile(fileName)
        this.checkInputFile()
        this.checkTRS()
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
                    this.constructors = line.replace('constructors=', '').match(this.regexpForConstructor).map( (constructor) => {
                        let [constructorName, n] = constructor.replace('(', ' ').replace(')', '').split(' ')
                        return {constructor : constructorName, n: Number(n)}
                    })
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
                default: {
                    this.terms.push(new Term(line))
                    break
                }
            }

        })
    }

    checkTRS() {
        for (let constructorKey in this.constructors) {
            if ((this.constructors[constructorKey].n !== 1) && (this.constructors[constructorKey].n !== 2)) throw Error(`Арность конструктора может быть 1 или 2 ( Арность конструктора ${this.constructors[constructorKey].constructor}(${this.constructors[constructorKey].n}) равна ${this.constructors[constructorKey].n} )`)
        }
        for (let variableKey in this.variables) {
            for (let constructorKey in this.constructors) {
                if (this.variables[variableKey] === this.constructors[constructorKey].constructor) throw Error(`Множество переменных и конструкторов не могут пересекаться ( Совпадают: ${this.variables[variableKey]} и ${this.constructors[constructorKey].constructor}(${this.constructors[constructorKey].n}) )`)
            }
        }
        for (let termKey in this.terms) {
            this.terms[termKey].parse(this.terms[termKey].leftSide, 0, this.terms[termKey].leftSideStructure)
            this.terms[termKey].parse(this.terms[termKey].rightSide, 0, this.terms[termKey].rightSideStructure)
        }
    }

    printParsingTree() {

    }

    print() {
        console.log(`Имя: ${this.name}\nКонструкторы: ${this.constructors.map((constructor) => {return constructor.constructor + '(' + constructor.n + ')'}).join(', ')}\nПеременные: ${this.variables.join(', ')}\nТермы:\n${this.terms.map((term) => {return term.term}).join('\n')}`)
    }
}

let TRS1 = new TRS('TRS1', 'input.txt')
TRS1.print()
console.log(TRS1.isCorrectSyntax)

console.log(TRS1.terms)


