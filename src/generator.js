import { IfStatement, Type } from "./core.js";
import { contents } from "./stdlib.js";

export default function generate(program) {
  const output = [];

  const standardFunctions = new Map([
    [contents.sin, (x) => `Math.sin(${x})`],
    [contents.cos, (x) => `Math.cos(${x})`],
    [contents.exp, (x) => `Math.exp(${x})`],
    [contents.ln, (x) => `Math.log(${x})`],
    [contents.hypot, ([x, y]) => `Math.hypot(${x},${y})`]
  ]);

  const targetName = ((mapping) => {
    return (entity) => {
      if (!mapping.has(entity)) {
        mapping.set(entity, mapping.size + 1);
      }
      return `${entity.name ?? entity.description}_${mapping.get(entity)}`;
    };
  })(new Map());

  function gen(node) {
    return generators[node.constructor.name](node);
  }

  const generators = {
    Program(p) {
      gen(p.statements);
    },

    VariableDeclaration(d) {
      output.push(`let ${gen(d.variable)} = ${gen(d.initializer)};`);
    },

    //function declaration don't work
    FunctionDeclaration(d) {
      // //console.log("d.body", d.body) //is undefinded with gen(d.body)
      //carlos generation below
      const paramNames = d.params.map(targetName).join(", ");
      output.push(
        `function ${gen(d.fun)}(${paramNames}) {` //gen(d.params) is undefinded - OG code
      );
      d.body.forEach(gen);
      output.push("}");

      //bella generation below
      // const params = d.params.map(targetName).join(", ");
      // output.push(`function ${targetName(d.fun)}(${params}) {`);
      // output.push(`return ${gen(d.body)};`);
      // output.push("}");
    },

    Assignment(s) {
      output.push(`${gen(s.target)} = ${gen(s.source)};`);
    },

    WhileStatement(s) {
      output.push(`while (${gen(s.test)}) {`);
      gen(s.body);
      output.push("}");
    },

    PrintStatement(s) {
      const argument = gen(s.argument);
      output.push(`console.log(${argument});`);
    },

    ExpStatement(s) {
      output.push(`${gen(s.expression)};`);
    },

    Conditional(e) {
      return `((${gen(e.test)}) ? (${gen(e.consequent)}) : (${gen(
        e.alternate
      )}))`;
    },

    BinaryExpression(e) {
      const op = { "==": "===", "!=": "!==" }[e.op] ?? e.op;
      return `(${gen(e.left)} ${op} ${gen(e.right)})`;
    },

    UnaryExpression(e) {
      return `${e.op}(${gen(e.operand)})`;
    },

    Variable(v) {
      return targetName(v);
    },

    Function(f) {
      return standardFunctions.get(f) ?? targetName(f);
    },

    //if statement just a tiny bit no work
    IfStatement(s) {
      output.push(`if (${gen(s.test)}) {`);
      gen(s.consequent);
      if (s.alternate) {
        if (s.alternate instanceof IfStatement) {
          output.push("} else");
          gen(s.alternate);
        } else {
          output.push("} else {");
          gen(s.alternate);
          output.push("}");
        }
      } else {
        output.push("}");
      }
    },

    //return doesn't work
    ReturnStatement(s) {
      output.push(`return ${gen(s.expression)};`);
    },

    //class declaration doesn't work
    ClassDeclaration(s) {
      //throw new Error("Code generation for classes not implemented yet.");

      // output.push(`class ${s.declaration} {`);
      // s.declaration.constructorDec;
      // for (let method of s.declaration.methods) {
      //     method;
      // }
      // output.push("}");
      //   gen(s.)
      output.push(`class ${targetName(s)} {`);
      gen(s.constructorDec);
      for (let method of s.methods) {
        gen(method);
      }
      output.push("}");
    },

    //constructor declaration doesn't work
    ConstructorDeclaration(s) {
      //   output.push(`create (${s.parameters.join(",")}) {`);
      //   for (let p of s.parameters) {
      //       output.push(`this."${targetName(p)}" = ${targetName(p)}`);
      //   }
      //   output.push("}");

      const parameterNames = s.parameters.map((p) => {
        // Remove any prefixes like 'put' or 'regular'
        p.name = p.name.split(" ")[1];
        return targetName(p);
      });
      console.log("Constructors Here");
      console.log(s);

      output.push(`constructor (${parameterNames.join(", ")}) {`);
      for (let p of parameterNames) {
        output.push(`this.${p} = ${p};`);
      }
      output.push("}");
    },

    // //constructor doesn't work
    // Constructor(s) {
    //   console.log("AAAA");
    //   console.log(s);
    //   return targetName(s);
    // },

    //method declaration doesn't work
    MethodDeclaration(s) {
      output.push(`${s.method} (${s.params.join(",")}) {`);
      gen(s.body);
      output.push("}");
    },

    Increment(s) {
      output.push(`${gen(s.variable)}++;`);
    },

    Decrement(s) {
      output.push(`${gen(s.variable)}--;`);
    },

    // //function call doesn't work
    FunctionCall(c) {
      // console.log("c:", c)
      // console.log("c.callee:", c.callee)
      // console.log("gen(c.args):", c.args); 	//undefined when i do gen(c.args)
      //carlos compiler below
      // const targetCode = standardFunctions.has(c.callee)
      //     ? standardFunctions.get(c.callee)(c.args)
      //     : `${gen(c.callee)}(${c.args.join(", ")})`;
      // // Calls in expressions vs in statements are handled differently
      // if (c.callee.type.returnType !== Type.VOID) {
      //     return targetCode;
      // }
      // output.push(`${targetCode}`);

      //bella compiler below
      const args = c.args.map(gen);
      const callee = gen(c.callee);
      return `${callee}(${args.join(",")})`;
    },

    Number(e) {
      return e;
    },

    BigInt(e) {
      return e;
    },

    Boolean(e) {
      return e;
    },

    Array(a) {
      a.forEach((e) => gen(e));
    }
  };

  gen(program);
  return output.join("\n");
}
