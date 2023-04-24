import { IfStatement, Type } from "./core.js";
import { contents } from "./stdlib.js";

export default function generate(program) {
    const output = [];

    const standardFunctions = new Map([
      [contents.sin, x => `Math.sin(${x})`],
      [contents.cos, x => `Math.cos(${x})`],
      [contents.exp, x => `Math.exp(${x})`],
      [contents.ln, x => `Math.log(${x})`],
      [contents.hypot, ([x, y]) => `Math.hypot(${x},${y})`],
    ])

    const targetName = ((mapping) => {
        return (entity) => {
            if (!mapping.has(entity)) {
                mapping.set(entity, mapping.size + 1);
            }
            return `${entity.name ?? entity.description}_${mapping.get(
                entity
            )}`;
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
            output.push(
                `function ${gen(d.fun)}(${d.params.join(", ")}) {` //gen(d.params) is undefinded - OG code
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

        //ForStatement don't work
        ForStatement(s) {
            // output.push(
            //     `for (${s.iterator} = ${s.low}; ${
            //         s.iterator
            //     } ${s.op} ${s.high}; ${s.iterator}++) {`
            // );
            // //gen(s.body);
			// s.body.forEach(gen);
            // output.push("}");

	    //   const i = targetName({ name: "i" });
        //   output.push(`for (let ${i} = 0; ${i} < ${gen(s.count)}; ${i}++) {`);
        //   gen(s.body);
        //   output.push("}");
			output.push(`for (let ${s.iterator} = ${s.low}; ${s.iterator} ${s.op} ${s.high}; ${s.iterator}++) {`);
			gen(s.body);
			output.push("}");

        },

        PrintStatement(s) {
            const argument = gen(s.argument);
            output.push(`console.log(${argument})`);
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

        //if statement don't work
        IfStatement(s) {
            // output.push(`if (${gen(s.test)}) {`);
            // s.consequent;
            // if (s.alternate instanceof IfStatement) {
            //     output.push("} else");
            //     s.alternate;
            // } else {
            //     output.push("} else {");
            //     s.alternate;
            //     output.push("}");
            // }

			console.log(s.alternate)
		    output.push(`if (${gen(s.test)}) {`);
            gen(s.consequent);
            output.push("}");
        },

		//return doesn't work
        ReturnStatement(s) {
            output.push(`return ${gen(s.expression)}`);
        },

		//class declaration doesn't work
        ClassDeclaration(s) {
            // output.push(`class ${s.declaration} {`);
            // s.declaration.constructorDec;
            // for (let method of s.declaration.methods) {
            //     method;
            // }
            // output.push("}");
			output.push(`class ${targetName(s.declaration)} {`);
			gen(s.declaration.constructorDec);
			for (let method of s.declaration.methods) {
				gen(method);
			}
			output.push("}");
			
        },

		//class doesn't work
        Class(c) {
            return targetName(c);
        },

		//constructor declaration doesn't work
        ConstructorDeclaration(s) {
            output.push(`create (${s.parameters.join(",")}) {`);
            for (let f of s.body) {
                output.push(
                    `this."${targetName(f.variable)}" = ${targetName(
                        f.initializer
                    )}`
                );
            }
            output.push("}");
        },

		//constructor doesn't work
        Constructor(s) {
			return targetName(s);
		},

		//method declaration doesn't work
        MethodDeclaration(s) {
			output.push(`${s.method} (${s.parameters.join(",")}) {`);
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
              const callee = c.callee;
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

        String(e) {
            return e;
        },

        Array(a) {
            a.forEach((e) => gen(e));
        },
    };

    let randomCalled = false;
    gen(program);
    if (randomCalled) output.push("function _r(a){return a[~~(Math.random()*a.length)]}")
    return output.join("\n");
}
