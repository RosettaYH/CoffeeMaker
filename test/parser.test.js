import assert from "node:assert/strict";
import parse from "../src/parser.js";

const syntaxChecks = [
  ["all numeric literal forms", "brew(8 * 89.123)"],
  ["all string literal forms", 'brew("hello") brew("world")'],
  ["all boolean literal forms", "brew(true) brew(false)"],
  ["all variable declarations", "regular x = 2"],
  ["all variable assignments", "regular x = 2 x = 3"],
  ["complex expressions", "brew((83 * 13 / 21) + 1 - 0)"],
  ["all unary operators", "brew(-3) brew(!false)"],
  ["all binary operators", "brew(x && y || z * 1 / 2 ** 3 + 4 < 5)"],
  ["all arithmetic operators", "regular x = 2 + 4 - (-7) * 8 ** 13 / 1"],
  ["all relational operators", "brew(1 > 2)"],
  ["all logical operators", "brew(true && false || (!false))"],
  ["the conditional operator", "brew(x ? y : z)"],
  ["comments okay at end of program", "brew(0) #yay\n"],
  ["non-Latin letters in identifiers", "regular コンパイラ = 100"],
  ["if statements", "sugar(true) {brew(1)} cream {brew(2)}"],
  [
    "while loops",
    "regular x = 0 while x < 5 {regular y = 0 while y < 5 {brew(x * y) y = y + 1} x = x + 1}"
  ],
  [
    "function declarations",
    "cup regular multiThree -> (regular z) {complete 3 - z}"
  ],
  [
    "class declarations",
    "keurig Person {create(self, put name, regular birthDate) {this.name = name this.birthDate = birthDate} cup put name -> (self, put x) {x}}"
  ]
];

const syntaxErrors = [
  ["non-letter in an identifier", "ab😭c = 2", /Line 1, col 3/],
  ["malformed number", "x= 2.", /Line 1, col 6/],
  ["a missing right operand", "brew(5 -", /Line 1, col 9/],
  ["a non-operator", "brew(7 * ((2 _ 3)", /Line 1, col 14/],
  ["an expression starting with a )", "x = )", /Line 1, col 5/],
  ["a statement starting with a )", "brew(5)\n) * 5", /Line 2, col 1/],
  ["an expression starting with a *", "x = * 71", /Line 1, col 5/],
  ["an expression starting with a /", "x = / 71", /Line 1, col 5/],
  ["an expression starting with a +", "x = + 71", /Line 1, col 5/],
  ["an expression starting with a **", "x = ** 71", /Line 1, col 5/],
  ["an expression starting with a <", "x = < 71", /Line 1, col 5/],
  ["an expression starting with a >", "x = > 71", /Line 1, col 5/],
  ["an expression starting with a <=", "x = <= 71", /Line 1, col 5/],
  ["an expression starting with a >=", "x = >= 71", /Line 1, col 5/],
  ["an expression starting with a ==", "x = == 71", /Line 1, col 5/],
  ["an expression starting with a &&", "x = && 71", /Line 1, col 5/],
  ["an expression starting with a ||", "x = || 71", /Line 1, col 5/],
  ["an expression starting with a ?", "x = ? 71", /Line 1, col 5/],
  ["an expression starting with a :", "x = : 71", /Line 1, col 5/],
  [
    "while loop with no condition",
    "regular x = 0 while {regular y = 0 while y < 5 {brew(x * y) y = y + 1} x = x + 1}",
    /Line 1, col 21/
  ],
  ["while loop with no body", "regular x = 0 while x < 5", /Line 1, col 26/],
  [
    "if statement with no condition",
    "sugar() {brew(1)} no sugar {brew(2)}",
    /Line 1, col 7/
  ],
  ["if statement with no body", "sugar(true)", /Line 1, col 12/],
  [
    "class declaration with no name",
    "keurig {create(self, put name, regular birthDate) {this.name = name this.birthDate = birthDate} cup put name -> (self, put x) {x}}",
    /Line 1, col 8/
  ],
  ["class declaration with no body", "keurig Person", /Line 1, col 14/],
  [
    "class declaration with no create",
    "keurig Person {cup put name -> (self, put x) {x}}",
    /Line 1, col 16/
  ],
  [
    "function declaration with no name",
    "cup regular -> (regular z) {complete 3 - z}",
    /Line 1, col 13/
  ]
];

describe("The parser", () => {
  for (const [scenario, source] of syntaxChecks) {
    it(`properly specifies ${scenario}`, () => {
      assert(parse(source).succeeded());
    });
  }
  for (const [scenario, source, errorMessagePattern] of syntaxErrors) {
    it(`does not permit ${scenario}`, () => {
      assert.throws(() => parse(source), errorMessagePattern);
    });
  }
});
