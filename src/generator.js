import { IfStatement } from "./core.js";
import { contents } from "./stdlib.js";

export default function generate(program) {
    const output = [];

    const standardFunctions = new Map([
        [contents.sin, (x) => `Math.sin(${x})`],
        [contents.cos, (x) => `Math.cos(${x})`],
        [contents.exp, (x) => `Math.exp(${x})`],
        [contents.ln, (x) => `Math.log(${x})`],
    ]);

    const targetName = ((mapping) => {
        return (entity) => {
            if (!mapping.has(entity)) {
                mapping.set(entity, mapping.size + 1);
            }
            return `${entity.name}_${mapping.get(entity)}`;
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

        FunctionDeclaration(d) {
            const paramNames = d.params.map(targetName).join(", ");
            output.push(`function ${gen(d.fun)}(${paramNames}) {`);
            d.body.forEach(gen);
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

        IfStatement(s) {
            output.push(`if (${gen(s.test)}) {`);
            gen(s.consequent);
            if (s.alternate instanceof IfStatement) {
                output.push(`} else`);
                gen(s.alternate);
            } else {
                output.push("} else {");
                gen(s.alternate);
                output.push("}");
            }
        },
        ShortIfStatement(s) {
            output.push(`if (${gen(s.test)}) {`);
            gen(s.consequent);
            output.push("}");
        },

        ReturnStatement(s) {
            output.push(`return ${gen(s.expression)};`);
        },

        ClassDeclaration(s) {
            output.push(`class ${targetName(s.id)} {`);
            gen(s.constructorDec);
            for (let method of s.methods) {
                gen(method);
            }
            output.push("}");
        },

        ConstructorDeclaration(s) {
            const parameterNames = s.parameters.map((p) => {
                p.name = p.name.split(" ")[1];
                return targetName(p);
            });

            output.push(`constructor(${parameterNames.join(", ")}) {`);
            for (let p of parameterNames) {
                output.push(`this.${p} = ${p};`);
            }
            output.push("}");
        },

        MethodDeclaration(s) {
            const paramNames = s.params.map(targetName).join(", ");
            output.push(`${targetName(s)}(${paramNames}) {`);
            gen(s.body);
            output.push("}");
        },

        Increment(s) {
            output.push(`${gen(s.variable)}++;`);
        },

        Decrement(s) {
            output.push(`${gen(s.variable)}--;`);
        },

        FunctionCall(c) {
            const args = c.args.map(gen);
            const callee = gen(c.callee);
            if (standardFunctions.has(c.callee)) {
                return standardFunctions.get(c.callee)(gen(c.args[0]));
            } else {
                return `${callee}(${args.join(",")})`;
            }
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
        },

        String(e) {
            return e;
        },
    };

    gen(program);
    return output.join("\n");
}
