import fs from "fs";
import ohm from "ohm-js";
import * as core from "./core.js";
import * as stdlib from "./stdlib.js";

const coffeemakerGrammar = ohm.grammar(fs.readFileSync("src/coffeemaker.ohm"));

const INT = core.Type.INT;
const FLOAT = core.Type.FLOAT;
const STRING = core.Type.STRING;
const BOOLEAN = core.Type.BOOLEAN;
const ANY = core.Type.ANY;
const VOID = core.Type.VOID;

function must(condition, message, errorLocation) {
  if (!condition) error(message, errorLocation);
}

function mustNotAlreadyBeDeclared(context, name) {
  must(!context.sees(name), `Identifier ${name} already declared`);
}

function mustHaveBeenFound(entity, name) {
  must(entity, `Identifier ${name} not declared`);
}

function mustHaveNumericType(e, at) {
  must([INT, FLOAT].includes(e.type), "Expected a number", at);
}

function mustHaveNumericOrStringType(e, at) {
  must(
    [INT, FLOAT, STRING].includes(e.type),
    "Expected a number or string",
    at
  );
}

function mustHaveBooleanType(e, at) {
  must(e.type === BOOLEAN, "Expected a boolean", at);
}

function mustHaveIntegerType(e, at) {
  must(e.type == FLOAT || e.type == INT, "Expected an integer", at);
}

function entityMustBeAType(e, at) {
  must(e instanceof core.Type, "Type expected", at);
}

function mustBeTheSameType(e1, e2, at) {
  must(equivalent(e1.type, e2.type), "Operands do not have the same type", at);
}

function equivalent(t1, t2) {
  return t1 === t2;
}

function assignable(fromType, toType) {
  return toType == ANY || equivalent(fromType, toType);
}

function mustBeAssignable(e, { toType: type }, at) {
  must(
    assignable(e.type, type),
    `Cannot assign a ${e.type.description} to a ${type.description}`,
    at
  );
}

function mustBeInAFunction(context, at) {
  must(context.function, "Return can only appear in a function", at);
}

function mustBeCallable(e, at) {
  must(
    e.type.constructor == core.FunctionType,
    "Call of non-function or non-constructor",
    at
  );
}

function mustReturnSomething(f, at) {
  must(f.type !== VOID, "Cannot return a value from this function", at);
}

function mustBeReturnable({ expression: e, from: f }, at) {
  mustBeAssignable(e, { toType: f.type.returnType }, at);
}

function argumentsMustMatch(args, targetTypes, at) {
  must(
    targetTypes.length === args.length,
    `${targetTypes.length} argument(s) required but ${args.length} passed`,
    at
  );
  targetTypes.forEach((type, i) => mustBeAssignable(args[i], { toType: type }));
}

function callArgumentsMustMatch(args, calleeType, at) {
  argumentsMustMatch(args, calleeType.paramTypes, at);
}

export function error(message, node) {
  if (node) {
    throw new Error(`${node.source.getLineAndColumnMessage()}${message}`);
  }
  throw new Error(message);
}

export function check(condition, message, node) {
  if (!condition) error(message, node);
}

class Context {
  constructor({
    parent = null,
    locals = new Map(),
    inLoop = false,
    function: f = null
  } = {}) {
    Object.assign(this, { parent, locals, inLoop, function: f });
  }
  sees(name) {
    return this.locals.has(name) || this.parent?.sees(name);
  }
  add(name, entity) {
    mustNotAlreadyBeDeclared(this, name);
    this.locals.set(name, entity);
  }
  lookup(name) {
    const entity = this.locals.get(name) || this.parent?.lookup(name);
    mustHaveBeenFound(entity, name);
    return entity;
  }
  newChildContext(props) {
    return new Context({
      ...this,
      ...props,
      parent: this,
      locals: new Map()
    });
  }
}

export default function analyze(sourceCode) {
  let context = new Context();

  const analyzer = coffeemakerGrammar.createSemantics().addOperation("rep", {
    Program(body) {
      return new core.Program(body.rep());
    },

    VarDec(type, id, _eq, initializer) {
      const initializerExp = initializer.rep();
      const variable = new core.Variable(id.sourceString, false, type.rep());
      context.add(id.sourceString, variable);
      mustBeAssignable(initializerExp, { toType: variable.type }, id);
      return new core.VariableDeclaration(variable, initializerExp);
    },

    FuncDec(_fun, returnType, id, _point, _open, params, _close, body) {
      const rt = returnType.rep();
      const paramReps = params.asIteration().rep();
      const paramTypes = paramReps.map((p) => p.type);
      const f = new core.Function(
        id.sourceString,
        new core.FunctionType(paramTypes, rt)
      );
      context.add(id.sourceString, f);
      context = context.newChildContext({ inLoop: false, function: f });
      for (const p of paramReps) {
        context.add(p.name, p);
      }
      const b = body.rep();
      context = context.parent;
      return new core.FunctionDeclaration(id.sourceString, f, paramReps, b);
    },

    ClassDec(_class, id, _start, constructor, method, _end) {
      const className = new core.Class(id.sourceString, true);
      context.add(id.sourceString, className);
      return new core.ClassDeclaration(
        className,
        constructor.rep(),
        method.rep()
      );
    },

    ConstructDec(
      _construct,
      _open,
      _self,
      _op,
      params,
      _close,
      _bodyOpen,
      _bodyClose,
      fields
    ) {
      params = params.asIteration().children;
      const cos = new core.Constructor(_self.sourceString, params.length, true);

      context.add(_self.sourceString, cos, _self);
      context = context.newChildContext({ inLoop: false });

      const paramsRep = params.map((p) => {
        let variable = new core.Variable(p.sourceString, true, p.rep().type);
        context.add(p.rep().name, p);
        return variable;
      });
      const fieldRep = fields.rep();
      context = context.parent;

      return new core.ConstructorDeclaration(paramsRep, fieldRep);
    },

    ParamType(type, id) {
      return new core.Variable(id.sourceString, false, type.rep());
    },

    MethodDec(
      _fun,
      returnType,
      id,
      _point,
      _open,
      _self,
      _op,
      params,
      _close,
      body
    ) {
      const paramReps = params.asIteration().rep();
      const paramTypes = paramReps.map((p) => p.type);
      const f = new core.Function(
        id.sourceString,
        new core.FunctionType(paramTypes, returnType.rep())
      );
      context.add(id.sourceString, f);
      context = context.newChildContext({ inLoop: false, function: f });
      for (const p of paramReps) {
        context.add(p.name, p);
      }
      const b = body.rep();
      context = context.parent;
      return new core.MethodDeclaration(id.sourceString, f, paramReps, b);
    },

    Statement_exp(e) {
      return new core.ExpStatement(e.rep());
    },

    Statement_assign(id, _eq, expression) {
      const e = expression.rep();
      const v = context.lookup(id.sourceString);
      mustBeAssignable(e, { toType: v.type });
      return new core.Assignment(v, e);
    },

    Statement_print(_print, argument) {
      return new core.PrintStatement(argument.rep(), argument.sourceString);
    },

    LoopStmt_while(_while, test, body) {
      const t = test.rep();
      mustHaveBooleanType(t);
      context = context.newChildContext({ inLoop: true });
      const b = body.rep();
      context = context.parent;
      return new core.WhileStatement(t, b);
    },

    IfStmt_long(_if, _left, exp, _right, block1, _else, block2) {
      const test = exp.rep();
      mustHaveBooleanType(test, { at: exp });
      context = context.newChildContext();
      const consequent = block1.rep();
      context = context.parent;
      context = context.newChildContext();
      const alternate = block2.rep();
      context = context.parent;
      return new core.IfStatement(test, consequent, alternate);
    },

    IfStmt_elsif(_if, _left, exp, _right, block, _else, trailingIfStatement) {
      const test = exp.rep();
      mustHaveBooleanType(test, { at: exp });
      context = context.newChildContext();
      const consequent = block.rep();
      const alternate = trailingIfStatement.rep();
      return new core.IfStatement(test, consequent, alternate);
    },

    IfStmt_short(_if, _left, exp, _right, block) {
      const test = exp.rep();
      mustHaveBooleanType(test, { at: exp });
      context = context.newChildContext();
      const consequent = block.rep();
      context = context.parent;
      return new core.ShortIfStatement(test, consequent);
    },

    UpdateExp(variable, operator) {
      const v = variable.rep();
      mustHaveIntegerType(v);
      return operator.sourceString === "++"
        ? new core.Increment(v)
        : new core.Decrement(v);
    },

    Statement_return(returnRep, expression) {
      mustBeInAFunction(context, returnRep);
      mustReturnSomething(context.function);
      const e = expression.rep();
      mustBeReturnable({ expression: e, from: context.function });
      return new core.ReturnStatement(e);
    },

    Block(_open, body, _close) {
      return body.rep();
    },

    Exp_unary(op, operand) {
      mustHaveNumericOrStringType(operand.rep());
      return new core.UnaryExpression(
        op.rep(),
        operand.rep(),
        operand.rep().type
      );
    },

    Exp_ternary(test, _questionMark, consequent, _colon, alternate) {
      const x = test.rep();
      mustHaveBooleanType(x);
      const [y, z] = [consequent.rep(), alternate.rep()];
      return new core.Conditional(x, y, z);
    },

    Exp1_or(left, op, right) {
      let [x, o, y] = [left.rep(), op.rep()[0], right.rep()];
      mustBeTheSameType(x, y);
      mustHaveBooleanType(x);
      return new core.BinaryExpression(o, x, y, BOOLEAN);
    },

    Exp2_and(left, op, right) {
      let [x, o, y] = [left.rep(), op.rep(), right.rep()];
      mustBeTheSameType(x, y);
      mustHaveBooleanType(x);
      return new core.BinaryExpression(o, x, y, BOOLEAN);
    },

    Exp3_compare(left, op, right) {
      const [x, o, y] = [left.rep(), op.sourceString, right.rep()];
      mustBeTheSameType(x, y);
      if (["<", "<=", ">", ">="].includes(op.sourceString)) {
        mustHaveNumericOrStringType(x);
      }
      return new core.BinaryExpression(o, x, y, BOOLEAN);
    },

    Exp4_add(left, op, right) {
      const [x, o, y] = [left.rep(), op.sourceString, right.rep()];
      mustBeTheSameType(x, y);
      if (o == "+" || o == "-") {
        mustHaveNumericType(x);
      }
      return new core.BinaryExpression(o, x, y, x.type);
    },

    Exp5_multiply(left, op, right) {
      const [x, o, y] = [left.rep(), op.sourceString, right.rep()];
      mustBeTheSameType(x, y);
      if (o == "*" || o == "/" || o == "%") {
        mustHaveNumericType(x);
      }
      return new core.BinaryExpression(o, x, y, x.type);
    },

    Exp6_power(left, op, right) {
      const [x, o, y] = [left.rep(), op.sourceString, right.rep()];
      if (o == "**") {
        mustHaveNumericType(x);
      }
      return new core.BinaryExpression(o, x, y, x.type);
    },

    Exp7_parens(_open, expression, _close) {
      return expression.rep();
    },

    Call(callee, _left, args, _right) {
      let [c, a] = [callee.rep(), args.asIteration().rep()];
      mustBeCallable(c);
      callArgumentsMustMatch(a, c.type);
      return new core.FunctionCall(c, a, c.type.returnType);
    },

    Exp7_id(_id) {
      return context.lookup(this.sourceString);
    },

    Type_id(id) {
      const entity = context.lookup(id.sourceString);
      entityMustBeAType(entity);
      return entity;
    },

    id(_first, _rest) {
      return context.lookup(this.sourceString);
    },

    true(_) {
      return true;
    },

    false(_) {
      return false;
    },

    num(_whole, _point, _fraction, _e, _sign, _exponent) {
      return Number(this.sourceString);
    },

    int(_whole) {
      return BigInt(this.sourceString);
    },

    stringlit(_open, _body, _close) {
      return String(this.sourceString);
    },

    _terminal() {
      return this.sourceString;
    },

    _iter(...children) {
      return children.map((child) => child.rep());
    }
  });

  for (const [name, type] of Object.entries(stdlib.contents)) {
    context.add(name, type);
  }
  const match = coffeemakerGrammar.match(sourceCode);
  if (!match.succeeded()) error(match.message);
  return analyzer(match).rep();
}
