const fs = require('fs')
const path = require('path')

class Term {
    
    constructor(term) {
        let [leftSide, rightSide] = term.split('=')
        this.full = term
        this.leftSide = leftSide
        this.rightSide = rightSide
        this.leftSideStructure = {}
        this.rightSideStructure = {}
        this.parse(this.leftSide, 0, this.leftSideStructure)
        this.parse(this.rightSide, 0, this.rightSideStructure)
        this.buildedLeftSideStructre = this.buildStructure(this.leftSide, this.leftSideStructure)
        this.buildedRightSideStructre = this.buildStructure(this.rightSide, this.rightSideStructure)
        this.leftSideArity = this.buildStructureArity(this.leftSide, this.leftSideStructure)
        this.rightSideArity = this.buildStructureArity(this.rightSide, this.rightSideStructure)
        this.leftSideDepth = this.calculateDepth(this.leftSide, this.leftSideStructure)
        this.rightSideDepth = this.calculateDepth(this.rightSide, this.rightSideStructure)
        this.maxDepth = Math.max(this.leftSideDepth, this.rightSideDepth)
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

    buildStructure(term, structure) {
        let result = `Структура терма ${term}: `
        build(structure)
        function build(structure) {
            if (structure.name) {
                result += structure.name
                if (structure.args) {
                    result += ' -> '
                    if (structure.args.length > 0) {
                        result += `${structure.args[0]},`
                    }
                    build(structure.args)
                } else return result
            }
        }
        return result
    }

    buildStructureArity(term, structure) {
        let result = []
        build(structure)
        function build(structure) {
            if (structure.name) {
                result.push({name: structure.name, args: 0})
                if (structure.args) {
                    for (let key in result) {
                        if (result[key].name === structure.name) result[key].args = 1
                    }
                    if (structure.args.length > 0) {
                        for (let key in result) {
                            if (result[key].name === structure.name) result[key].args += 1
                        }
                    }
                    build(structure.args)
                } else return result
            }
        }
        return result
    }

    calculateDepth(term, structure) {
        let result = 0
        build(structure)
        function build(structure) {
            if (structure.name) {
                if (structure.args) {
                    result++
                    build(structure.args)
                } else return result
            }
        }
        return result
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
            let arity = this.constructors[constructorKey].n;
            if ((arity !== 1) && (arity !== 2)) throw Error(`Арность конструктора может быть 1 или 2 ( Арность конструктора ${this.constructors[constructorKey].constructor}(${arity}) равна ${arity} )`)
            for (let termKey in this.terms) {
                
            }
        }
        for (let variableKey in this.variables) {
            for (let constructorKey in this.constructors) {
                if (this.variables[variableKey] === this.constructors[constructorKey].constructor) throw Error(`Множества переменных и конструкторов не могут пересекаться ( Совпадают: ${this.variables[variableKey]} и ${this.constructors[constructorKey].constructor}(${this.constructors[constructorKey].n}) )`)
            }
        }
        let depthTerm = this.terms.filter((term) => term.maxDepth > 3)
        if (depthTerm.length > 0) {
            console.log(depthTerm)
            throw Error(`Максимальная вложенность термов не может превышать 3 (Маскимальная вложенность термов в терме ${depthTerm.full}: ${depthTerm.maxDepth})`)
        }
        for (let constructorKey in this.constructors) {
            for (let termKey in this.terms) {
                for (let lKey in this.terms[termKey].leftSideArity) {
                    let termConstructor = this.terms[termKey].leftSideArity[lKey], constructor = this.constructors[constructorKey]
                    if (constructor.constructor === termConstructor.name) {
                        if (constructor.n !== termConstructor.args) throw Error(`Арность конструкторов должна совадать (Несовпадение: ${constructor.constructor}(${constructor.n}) и ${termConstructor.name}(${termConstructor.args}))`)
                    }
                }
                for (let rKey in this.terms[termKey].rightSideArity) {
                    let termConstructor = this.terms[termKey].rightSideArity[rKey], constructor = this.constructors[constructorKey]
                    if (constructor.name === termConstructor.name) {
                        console.log(constructor.name + " " + termConstructor.name)
                        if (constructor.n !== termConstructor.args) throw Error(`Арность конструкторов должна совпадать (Несовпадение: ${constructor.constructor}(${constructor.n}) и ${termConstructor.name}(${termConstructor.args}))`)
                    }
                }
            }
        }
    }

    print() {
        console.log(`Имя: ${this.name}\nКонструкторы: ${this.constructors.map((constructor) => {return constructor.constructor + '(' + constructor.n + ')'}).join(', ')}\nПеременные: ${this.variables.join(', ')}\nТермы:\n${this.terms.map((term) => {return term.full}).join('\n')}`)
    }
}

let TRS1 = new TRS('TRS1', 'input.txt')
TRS1.print()
console.log(TRS1.isCorrectSyntax)
