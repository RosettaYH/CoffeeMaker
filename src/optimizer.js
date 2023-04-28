import * as core from "./core.js";

export default function optimize(node) {
  return optimizers[node.constructor.name](node);
}

const optimizers = {
  Program(p) {
    p.statements = optimize(p.statements);
    return p;
  },
  PrintStatement(s) {
	s.argument = optimize(s.argument);
	return s;
  },
  VariableDeclaration(d) {
    d.variable = optimize(d.variable);
    d.initializer = optimize(d.initializer);
    return d;
  },
  FunctionDeclaration(d) {
    d.fun = optimize(d.fun);
    if (d.body) d.body = optimize(d.body);
    return d;
  },
  Variable(v) {
    return v;
  },
  Function(f) {
    return f;
  },
  Increment(s) {
    s.variable = optimize(s.variable);
    return s;
  },
  Decrement(s) {
    s.variable = optimize(s.variable);
    return s;
  },
  Assignment(s) {
    s.source = optimize(s.source);
    s.target = optimize(s.target);
    if (s.source === s.target) {
      return [];
    }
    return s;
  },
  ReturnStatement(s) {
    s.expression = optimize(s.expression);
    return s;
  },
  IfStatement(s) {
    s.test = optimize(s.test);
    s.consequent = optimize(s.consequent);
    s.alternate = optimize(s.alternate);
    if (s.test.constructor === Boolean) {
      return s.test ? s.consequent : s.alternate;
    }
    return s;
  },
  ShortIfStatement(s) {
    s.test = optimize(s.test);
    s.consequent = optimize(s.consequent);
    if (s.test.constructor === Boolean) {
      return s.test ? s.consequent : [];
    }
    return s;
  },
  WhileStatement(s) {
    s.test = optimize(s.test);
    if (s.test === false) {
      return [];
    }
  },
  Conditional(e) {
    e.test = optimize(e.test);
    e.consequent = optimize(e.consequent);
    e.alternate = optimize(e.alternate);
    if (e.test.constructor === Boolean) {
      return e.test ? e.consequent : e.alternate;
    }
    return e;
  },
  BinaryExpression(e) {
    e.op = optimize(e.op);
    e.left = optimize(e.left);
    e.right = optimize(e.right);
    if (e.op === "&&") {
      if (e.left === true) return e.right;
      else if (e.right === true) return e.left;
    } else if (e.op === "||") {
      if (e.left === false) return e.right;
      else if (e.right === false) return e.left;
    } else if ([Number, BigInt].includes(e.left.constructor)) {
      if ([Number, BigInt].includes(e.right.constructor)) {
        if (e.op === "+") return e.left + e.right;
        else if (e.op === "-") return e.left - e.right;
        else if (e.op === "*") return e.left * e.right;
        else if (e.op === "/") return e.left / e.right;
        else if (e.op === "**") return e.left ** e.right;
        else if (e.op === "<") return e.left < e.right;
        else if (e.op === "<=") return e.left <= e.right;
        else if (e.op === "==") return e.left === e.right;
        else if (e.op === "!=") return e.left !== e.right;
        else if (e.op === ">=") return e.left >= e.right;
        else if (e.op === ">") return e.left > e.right;
      } else if (e.left === 0 && e.op === "+") return e.right;
      else if (e.left === 1 && e.op === "*") return e.right;
      else if (e.left === 0 && e.op === "-")
        return new core.UnaryExpression("-", e.right);
      else if (e.left === 1 && e.op === "**") return 1;
      else if (e.left === 0 && ["*", "/"].includes(e.op)) return 0;
    } else if (e.right.constructor === Number) {
      if (["+", "-"].includes(e.op) && e.right === 0) return e.left;
      else if (["*", "/"].includes(e.op) && e.right === 1) return e.left;
      else if (e.op === "*" && e.right === 0) return 0;
      else if (e.op === "**" && e.right === 0) return 1;
    }
    return e;
  },
  UnaryExpression(e) {
    e.op = optimize(e.op);
    e.operand = optimize(e.operand);
    if (e.operand.constructor === Number) {
      if (e.op === "-") {
        return -e.operand;
      }
    }
    return e;
  },

  FunctionCall(c) {
    c.callee = optimize(c.callee);
    c.args = optimize(c.args);
    return c;
  },
  BigInt(e) {
    return e;
  },
  Number(e) {
    return e;
  },
  Boolean(e) {
    return e;
  },
  String(e) {
    return e;
  },
  Array(a) {
    return a.flatMap(optimize);
  }
};
