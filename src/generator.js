import { IfStatement, Type } from "./core.js"

export default function generate(program) {
  const output = []

  //   const standardFunctions = new Map([
  //   [standardLibrary.print, x => `console.log(${x})`],
  //   [standardLibrary.sin, x => `Math.sin(${x})`],
  //   [standardLibrary.cos, x => `Math.cos(${x})`],
  //   [standardLibrary.exp, x => `Math.exp(${x})`],
  //   [standardLibrary.ln, x => `Math.log(${x})`],
  //   [standardLibrary.hypot, ([x, y]) => `Math.hypot(${x},${y})`],
  //   // [standardLibrary.bytes, s => `[...Buffer.from(${s}, "utf8")]`],
  //   // [standardLibrary.codepoints, s => `[...(${s})].map(s=>s.codePointAt(0))`],
  // ])

  const targetName = (mapping => {
    return entity => {
      if (!mapping.has(entity)) {
        mapping.set(entity, mapping.size + 1)
      }
      return `${entity.name ?? entity.description}_${mapping.get(entity)}`
    }
  })(new Map())

  function gen(node) {
    console.log(node.constructor.name)
    return generators[node.constructor.name](node)
  }


  const generators = {
    Program(p) {
      gen(p.statements)
    },
    VariableDeclaration(d) {
      // We don't care about const vs. let in the generated code! The analyzer has
      // already checked that we never updated a const, so let is always fine.
      output.push(`let ${gen(d.variable)} = ${gen(d.initializer)};`)
    },
    FunctionDeclaration(d) {
      output.push(`cup ${gen(d.type)} ${gen(d.fun)} -> (${gen(d.params).join(", ")}) {`)
      gen(d.body)
      output.push("}")
    },
    Assignment(s) {
      output.push(`${gen(s.target)} = ${gen(s.source)};`)
    },
    WhileStatement(s) {
      output.push(`while (${gen(s.test)}) {`)
      gen(s.body)
      output.push("}")
    },
    PrintStatement(s) {
      output.push(`brew (${gen(s.argument)})`)
    },
    Conditional(e) {
      return `((${gen(e.test)}) ? (${gen(e.consequent)}) : (${gen(e.alternate)}))`
    },
    BinaryExpression(e) {
      const op = { "==": "===", "!=": "!==" }[e.op] ?? e.op
      return `(${gen(e.left)} ${op} ${gen(e.right)})`
    },
    UnaryExpression(e) {
      return `${e.op}(${gen(e.operand)})`
    },
    // UnaryExpression(e) {
    //   const operand = gen(e.operand)
    //   if (e.op === "some") {
    //     return operand
    //   } else if (e.op === "#") {
    //     return `${operand}.length`
    //   } else if (e.op === "random") {
    //     randomCalled = true
    //     return `_r(${operand})`
    //   }
    //   return `${e.op}(${operand})`
    // },
    Variable(v) {
      return targetName(v)
    },
    Function(f) {
      return targetName(f)
    },
    IfStatement(s) {
      output.push(`sugar (${gen(s.test)}) {`)
      gen(s.consequent)
      if (s.alternate instanceof IfStatement) {
        output.push("} salt")
        gen(s.alternate)
      } else {
        output.push("} no sugar {")
        gen(s.alternate)
        output.push("}")
      }
    },
    ReturnStatement(s) {
      output.push(`complete (${gen(s.expression)})`)
    },
    ClassDeclaration(s) {
      output.push(`keurig Car {`)
      gen(d.constructorDec)
      for (let method of d.methods) {
        gen(method)
      }
      output.push("}")
    },
    Class (c) {
      // Maybe?
      return targetName(c)
    },
    Type(t) {
      // No code to be generated for type objects
    },
    ConstructorDeclaration (s) {
        output.push(`create (self, ${gen(s.parameters).join(",")}) {`)
        for (let f of s.body) {
            output.push(`this."${targetName(f.variable)}" = ${targetName(f.initializer)}`)
        }
        output.push("}")
    },
    Constructor (s) {

    },
    MethodDeclaration (s) {

    },
    Increment(s) {
      output.push(`${gen(s.variable)}++;`)
    },
    Decrement(s) {
      output.push(`${gen(s.variable)}--;`)
    },
    FunctionCall(c) {
      const targetCode = standardFunctions.has(c.callee)
        ? standardFunctions.get(c.callee)(gen(c.args))
        : `${gen(c.callee)}(${gen(c.args).join(", ")})`
      // Calls in expressions vs in statements are handled differently
      if (c.callee.type.returnType !== Type.VOID) {
        return targetCode
      }
      output.push(`${targetCode};`)
    },
    Number(e) {
      return e
    },
    BigInt(e) {
      return e
    },
    Boolean(e) {
      return e
    },
    String(e) {
      return e
    },
    Array(a) {
      a.forEach(e => gen(e))
    }
  }

  let randomCalled = false
  console.log(program)
  gen(program)
  // if (randomCalled) output.push("function _r(a){return a[~~(Math.random()*a.length)]}")
  return output.join("\n")
}
