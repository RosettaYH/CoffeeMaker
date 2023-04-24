import { IfStatement, Type } from "./core.js";

export default function generate(program) {
    const output = [];

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
            output.push(
                `function ${gen(d.fun)}(${gen(d.params).join(", ")}) {`
            );
            gen(d.body);
            output.push("}");
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
            output.push(
                `for (${gen(s.iterator)} = ${gen(s.low)}; ${gen(
                    s.iterator
                )} ${gen(s.op)} ${gen(s.high)}; ${gen(s.iterator)}++) {`
            );
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
            return targetName(f);
        },

        //if statement don't work
        IfStatement(s) {
            output.push(`if (${gen(s.test)}) {`);
            gen(s.consequent);
            if (s.alternate instanceof IfStatement) {
                output.push("} else");
                gen(s.alternate);
            } else {
                output.push("} else {");
                gen(s.alternate);
                output.push("}");
            }
        },

		//return doesn't work
        ReturnStatement(s) {
            output.push(`return ${gen(s.expression)}`);
        },

		//class declaration doesn't work
        ClassDeclaration(s) {
            output.push(`class ${gen(s.declaration)} {`);
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
            output.push(`create (${gen(s.parameters).join(",")}) {`);
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
			output.push(`${gen(s.method)} (${gen(s.parameters).join(",")}) {`);
			gen(s.body);
			output.push("}");
		},

        Increment(s) {
            output.push(`${gen(s.variable)}++;`);
        },

        Decrement(s) {
            output.push(`${gen(s.variable)}--;`);
        },

		//function call doesn't work
        FunctionCall(c) {
            const targetCode = standardFunctions.has(c.callee)
                ? standardFunctions.get(c.callee)(gen(c.args))
                : `${gen(c.callee)}(${gen(c.args).join(", ")})`;
            // Calls in expressions vs in statements are handled differently
            if (c.callee.type.returnType !== Type.VOID) {
                return targetCode;
            }
            output.push(`${targetCode};`);
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

    //let randomCalled = false;
    //console.log(program)
    gen(program);
    // if (randomCalled) output.push("function _r(a){return a[~~(Math.random()*a.length)]}")
    return output.join("\n");
}
