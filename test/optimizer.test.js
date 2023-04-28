import assert from "node:assert/strict";
import optimize from "../src/optimizer.js";
import * as core from "../src/core.js";

const x = new core.Variable("x", false, core.Type.INT);
const xpp = new core.Increment(x);
const xmm = new core.Decrement(x);
const return1p1 = new core.ReturnStatement(
  new core.BinaryExpression("+", 1, 1, core.Type.INT)
);
const return2 = new core.ReturnStatement(2);
const returnX = new core.ReturnStatement(x);
const identity = Object.assign(new core.Function("id"), { body: returnX });
const voidInt = new core.FunctionType([], core.Type.INT);
const intFun = (body) =>
  new core.FunctionDeclaration(
    "f",
    new core.Function("f", voidInt),
    [],
    [body]
  );
const callIdentity = (args) => new core.FunctionCall(identity, args);
const or = (...d) => d.reduce((x, y) => new core.BinaryExpression("||", x, y));
const and = (...c) => c.reduce((x, y) => new core.BinaryExpression("&&", x, y));
const less = (x, y) => new core.BinaryExpression("<", x, y);
const eq = (x, y) => new core.BinaryExpression("==", x, y);
const times = (x, y) => new core.BinaryExpression("*", x, y);
const neg = (x) => new core.UnaryExpression("-", x);
const unwrapElse = (o, e) => new core.BinaryExpression("??", o, e);
const conditional = (x, y, z) => new core.Conditional(x, y, z);
const some = (x) => new core.UnaryExpression("some", x);

const classDec = (name, constructor, meth) => new core.ClassDeclaration(name, constructor, meth);


const tests = [
    ["folds +", new core.BinaryExpression("+", 5, 8), 13],
    ["folds -", new core.BinaryExpression("-", 5n, 8n), -3n],
    ["folds *", new core.BinaryExpression("*", 5, 8), 40],
    ["folds /", new core.BinaryExpression("/", 5, 8), 0.625],
    ["folds **", new core.BinaryExpression("**", 5, 8), 390625],
    ["folds <", new core.BinaryExpression("<", 5, 8), true],
    ["folds <=", new core.BinaryExpression("<=", 5, 8), true],
    ["folds ==", new core.BinaryExpression("==", 5, 8), false],
    ["folds !=", new core.BinaryExpression("!=", 5, 8), true],
    ["folds >=", new core.BinaryExpression(">=", 5, 8), false],
    ["folds >", new core.BinaryExpression(">", 5, 8), false],
    ["optimizes +0", new core.BinaryExpression("+", x, 0), x],
    ["optimizes -0", new core.BinaryExpression("-", x, 0), x],
    ["optimizes *1", new core.BinaryExpression("*", x, 1), x],
    ["optimizes /1", new core.BinaryExpression("/", x, 1), x],
    ["optimizes *0", new core.BinaryExpression("*", x, 0), 0],
    ["optimizes 0*", new core.BinaryExpression("*", 0, x), 0],
    ["optimizes 0/", new core.BinaryExpression("/", 0, x), 0],
    ["optimizes 0+", new core.BinaryExpression("+", 0, x), x],
    ["optimizes 0-", new core.BinaryExpression("-", 0, x), neg(x)],
    ["optimizes 1*", new core.BinaryExpression("*", 1, x), x],
    ["folds negation", new core.UnaryExpression("-", 8), -8],
    ["optimizes 1**", new core.BinaryExpression("**", 1, x), 1],
    ["optimizes **0", new core.BinaryExpression("**", x, 0), 1],
    ["removes left false from ||", or(false, less(x, 1)), less(x, 1)],
    ["removes right false from ||", or(less(x, 1), false), less(x, 1)],
    ["removes left true from &&", and(true, less(x, 1)), less(x, 1)],
    ["removes right true from &&", and(less(x, 1), true), less(x, 1)],
    ["removes x=x at beginning", [new core.Assignment(x, x), xpp], [xpp]],
    ["removes x=x at end", [xpp, new core.Assignment(x, x)], [xpp]],
    [
        "removes x=x in middle",
        [xpp, new core.Assignment(x, x), xpp],
        [xpp, xpp],
    ],
    ["optimizes if-true", new core.IfStatement(true, xpp, []), xpp],
    ["optimizes if-false", new core.IfStatement(false, [], xpp), xpp],
    ["optimizes short-if-true", new core.ShortIfStatement(true, xmm), xmm],
    ["optimizes short-if-false", [new core.ShortIfStatement(false, xpp)], []],
    ["optimizes while-false", [new core.WhileStatement(false, xpp)], []],
    [
        "applies if-false after folding",
        new core.ShortIfStatement(eq(1, 1), xpp),
        xpp,
    ],
    ["optimizes left conditional true", conditional(true, 55, 89), 55],
    ["optimizes left conditional false", conditional(false, 55, 89), 89],
    ["optimizes in functions", intFun(return1p1), intFun(return2)],
    ["optimizes in arguments", callIdentity([times(3, 5)]), callIdentity([15])],
    [
        "passes through nonoptimizable constructs",
        ...Array(2).fill([
            new core.Program([new core.ReturnStatement(x)]),
            new core.VariableDeclaration("x", true, "z"),
            new core.Assignment(x, new core.BinaryExpression("*", x, "z")),
            new core.Assignment(x, new core.UnaryExpression("not", x)),
            new core.VariableDeclaration("q", false),
            new core.VariableDeclaration("r", false),
            conditional(x, 1, 2),
            unwrapElse(some(x), 7),
            new core.IfStatement(x, [], []),
            new core.ShortIfStatement(x, []),
        ]),
    ],
    [
        "optimized in class",
		classDec(
			"className",
			new core.ConstructorDeclaration(
				x,
				[],
			),
			[
				new core.MethodDeclaration("name", [], [], []),
			]
		),
		classDec(
			"className",
			new core.ConstructorDeclaration(
				x,
				[],
			),
			[
				new core.MethodDeclaration("name", [], [], []),
			]
		),
    ],
];

describe("The optimizer", () => {
  for (const [scenario, before, after] of tests) {
    it(`${scenario}`, () => {
      assert.deepEqual(optimize(before), after);
    });
  }
});
