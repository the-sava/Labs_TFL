const fs = require('fs')
const path = require('path')
function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substring(0,index) + chr + str.substring(index+1);
}
class Tree {

}

class Node {

    constructor(name, parent) {
        this.name = name
        this.args = []
        this.parent = parent
    }

    getParent() {
        return this.parent
    }

}

class Term {
    
    constructor(term, TRS) {
        // [f,[g[h[x,x]],y],x]
        let [leftSide, rightSide] = term.split('=')
        this.full = term
        this.TRS = TRS
        this.leftSide = leftSide
        this.rightSide = rightSide
        this.leftSideParsed = []
        this.rightSideParsed = []
        this.parseTerm(this.leftSide, this.leftSideParsed)
        this.parseTerm(this.rightSide, this.rightSideParsed)
        // this.parse(this.leftSide, 0, this.leftSideStructure, this.leftSideStructure)
        // this.parse(this.rightSide, 0, this.rightSideStructure, this.rightSideStructure)
        // this.buildedLeftSideStructre = this.buildStructure(this.leftSide, this.leftSideStructure)
        // this.buildedRightSideStructre = this.buildStructure(this.rightSide, this.rightSideStructure)
        // this.leftSideArity = this.buildStructureArity(this.leftSide, this.leftSideStructure)
        // this.rightSideArity = this.buildStructureArity(this.rightSide, this.rightSideStructure)
        // this.leftSideDepth = this.calculateDepth(this.leftSide, this.leftSideStructure)
        // this.rightSideDepth = this.calculateDepth(this.rightSide, this.rightSideStructure)
        // this.maxDepth = Math.max(this.leftSideDepth, this.rightSideDepth)
    }

    parseTerm(term, parsed) {
        let result = {}
        if (term === '') {
            return
        }
        if (term.indexOf(' ') !== -1) {
            let subTerm = term.slice(0, term.indexOf(' '))
            if (this.TRS.constructors.find((constructor) => {return constructor.constructor === subTerm[0]})) {
                result.name = subTerm[0]
                let indexBracketLeft = subTerm.indexOf('(')
                let indexBracketRight = subTerm.lastIndexOf(')')
                let indexComma = indexBracketLeft
                let c = 0
                result.args = []
                subTerm = setCharAt(subTerm, indexBracketLeft, '*')
                subTerm = setCharAt(subTerm, indexBracketRight, '*')
                for (let i = indexBracketLeft + 1; i < indexBracketRight; i++) {
                    if (subTerm[i] === '(') c++
                    else if (subTerm[i] === ')') c--
                    if ( (subTerm[i] === ',') && (c === 0) ) indexComma = i
                }
                if (indexComma === indexBracketLeft) result.args.push(subTerm.slice(indexBracketLeft + 1, indexBracketRight))
                else {
                    result.args.push(subTerm.slice(indexBracketLeft + 1, indexComma))
                    result.args.push(subTerm.slice(indexComma + 1, indexBracketRight))
                }
                parsed.push(result)
                if (indexComma !== indexBracketLeft) subTerm = setCharAt(term, indexComma, '')
                this.parseTerm(term.slice(subTerm.indexOf('*') + 1, term.lastIndexOf('*')), parsed)
            } else if (this.TRS.variables.indexOf(term[0]) !== -1) {
                result.name = subTerm[0]
                parsed.push(result)
                this.parseTerm(term.slice(term.indexOf(' ') + 1), parsed)
            }
        }
        else if (this.TRS.constructors.find((constructor) => {return constructor.constructor === term[0]})) {
            result.name = term[0]
            let indexBracketLeft = term.indexOf('(')
            let indexBracketRight = term.lastIndexOf(')')
            let indexComma = indexBracketLeft
            let c = 0
            result.args = []
            term = setCharAt(term, indexBracketLeft, '*')
            term = setCharAt(term, indexBracketRight, '*')
            for (let i = indexBracketLeft + 1; i < indexBracketRight; i++) {
                if (term[i] === '(') c++
                else if (term[i] === ')') c--
                if ( (term[i] === ',') && (c === 0) ) indexComma = i
            }
            if (indexComma === indexBracketLeft) result.args.push(term.slice(indexBracketLeft + 1, indexBracketRight))
            else {
                result.args.push(term.slice(indexBracketLeft + 1, indexComma))
                result.args.push(term.slice(indexComma + 1, indexBracketRight))
            }
            parsed.push(result)
            if (indexComma !== indexBracketLeft) term = setCharAt(term, indexComma, ' ')
            this.parseTerm(term.slice(term.indexOf('*') + 1, term.lastIndexOf('*')), parsed)
        } else if (this.TRS.variables.indexOf(term[0]) !== -1) {
            result.name = term[0]
            parsed.push(result)
            this.parseTerm(term.replace(result.name, ''), parsed)
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

    stringStructure(structure) {
        let result = ``
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
                    this.terms.push(new Term(line, this))
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
            throw Error(`Максимальная вложенность конструкторов в терме не может превышать 3 (Маскимальная вложенность конструкторов в терме ${depthTerm[0].full}: ${depthTerm[0].maxDepth})`)
        }
        for (let constructorKey in this.constructors) {
            for (let termKey in this.terms) {
                for (let lKey in this.terms[termKey].leftSideArity) {
                    let termConstructor = this.terms[termKey].leftSideArity[lKey], constructor = this.constructors[constructorKey]
                    if (constructor.constructor === termConstructor.name) {
                        if (constructor.n !== termConstructor.args) {
                            console.log(constructor.n + ' ' + termConstructor.args)
                            throw Error(`Арность конструкторов должна совпадать (Несовпадение: ${constructor.constructor}(${constructor.n}) в терме ${this.terms[termKey].full})`)
                        }
                    }
                }
                for (let rKey in this.terms[termKey].rightSideArity) {
                    let termConstructor = this.terms[termKey].rightSideArity[rKey], constructor = this.constructors[constructorKey]
                    if (constructor.name === termConstructor.name) {
                        console.log(constructor.name + " " + termConstructor.name)
                        if (constructor.n !== termConstructor.args) throw Error(`Арность конструкторов должна совпадать (Несовпадение: ${constructor.constructor}(${constructor.n}) в терме ${this.terms[termKey].full})`)
                    }
                }
            }
        }
    }

    // knutBendix() {
    //     for (let term of this.terms) {
    //         firstStage(term, term.leftSideStructure, term.rightSideStructure)
    //     }
    //     function firstStage(term, structure, otherStructure) {
    //         if (structure.name) {
    //             if (structure.args.stringStructure(structure.args) === otherStructure.stringStructure(otherStructure)) {
    //                 return 'Завершается по первому правилу по первому аргументу'
    //             }
    //             if (structure.args.length > 0) {
    //                 if (structure.args.stringStructure(structure.args[0]) === otherStructure.stringStructure(otherStructure)) {
    //                     return 'Завершается по первому правилу по второму аргументу'
    //                 }
    //             }
    //         }
    //     }
    // }

    print() {
        console.log(`Имя: ${this.name}\nКонструкторы: ${this.constructors.map((constructor) => {return constructor.constructor + '(' + constructor.n + ')'}).join(', ')}\nПеременные: ${this.variables.join(', ')}\nТермы:\n${this.terms.map((term) => {return term.full}).join('\n')}`)
    }
}

// let TRS1 = new TRS('TRS1', 'input1.txt')
// let TRS2 = new TRS('TRS2', 'input2.txt')
let T1 = new TRS('T1', 't1.txt')
// TRS1.print()
// TRS2.print()
T1.print()
for (let term of T1.terms) {
    console.log(term.leftSideParsed)
    console.log(term.rightSideParsed)
}

