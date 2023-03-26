import util from "util";
import stringify from "graph-stringify";

export class Program {
  constructor(statements) {
    this.statements = statements;
  }
  [util.inspect.custom]() {
    return stringify(this);
  }
}

export class VariableDeclaration {
  constructor(variable, initializer) {
    Object.assign(this, { variable, initializer });
  }
}

export class FunctionDeclaration {
  constructor(name, fun, params, body) {
    Object.assign(this, {name, fun, params, body });
  }
}

export class Assignment {
  constructor(target, source) {
    Object.assign(this, { target, source });
  }
}

export class WhileStatement {
  constructor(test, body) {
    Object.assign(this, { test, body });
  }
}

export class PrintStatement {
  constructor(argument) {
    Object.assign(this, { argument });
  }
}

export class Call {
  constructor(callee, args) {
    Object.assign(this, { callee, args });
  }
}

export class Conditional {
  constructor(test, consequent, alternate) {
    Object.assign(this, { test, consequent, alternate });
  }
}

export class BinaryExpression {
  constructor(op, left, right, type) {
    Object.assign(this, { op, left, right, type });
  }
}

export class UnaryExpression {
  constructor(op, operand) {
    Object.assign(this, { op, operand });
  }
}

export class Variable {
  // Generated when processing a variable declaration
  constructor(name, readOnly, type) {
    Object.assign(this, { name, readOnly, type });
  }
}

export class Function {
  constructor(name, type) {
    Object.assign(this, { name, type });
  }
}

export class IfStatement {
  constructor(test, consequent, alternate) {
    Object.assign(this, { test, consequent, alternate });
  }
}

export class ReturnStatement {
  constructor(expression) {
    this.expression = expression;
  }
}

export class ClassDeclaration {
  constructor(id, constructorDec, methods) {
    Object.assign(this, { id, constructorDec, methods });
  }
}
export class Class {
  constructor(name, readOnly) {
    Object.assign(this, { name, readOnly });
  }
}

export class ConstructorDeclaration {
  constructor(parameters, body) {
    Object.assign(this, { parameters, body });
  }
}

//added constructor
export class Constructor {
  constructor(name, paramCount, readOnly) {
    Object.assign(this, { name, paramCount, readOnly });
  }
}

export class MethodDeclaration {
  constructor(name, meth, params, body) {
    Object.assign(this, { name, meth, params, body });
  }
}

export class Increment {
  // Example: count++
  constructor(variable) {
    this.variable = variable;
  }
}

export class Decrement {
  // Example: count--
  constructor(variable) {
    this.variable = variable;
  }
}

export class FunctionCall {
	constructor(callee, args, type) {
		Object.assign(this, { callee, args, type });
  }
}

export class ConstructorCall {
    constructor(callee, args, type) {
        Object.assign(this, { callee, args, type });
    }
}

export class Type {
  static INT = new Type("regular");
  static FLOAT = new Type("decaf");
  static STRING = new Type("put");
  static VOID = new Type("void");
  static BOOLEAN = new Type("boolean");
  static ANY = new Type("any");
  constructor(description) {
    Object.assign(this, { description });
  }
}

export class FunctionType extends Type {
  constructor(paramTypes, returnType) {
    super(
      `(${paramTypes.map((t) => t.description).join(",")})->${
        returnType.description
      }`
    );
    Object.assign(this, { paramTypes, returnType });
  }
}

export class ClassType extends Type {
    constructor(name, fields) {
        super(name);
        Object.assign(this, { fields });
    }
}

String.prototype.type = Type.STRING;
Number.prototype.type = Type.FLOAT;
BigInt.prototype.type = Type.INT;
Boolean.prototype.type = Type.BOOLEAN;
