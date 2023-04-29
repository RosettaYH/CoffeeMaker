import util from "util";
import assert from "assert/strict";
import analyze, { error, check } from "../src/analyzer.js";

const semanticChecks = [
  ["variables can be printed", 'brew("A cup of coffee")'],
  ["variables declaration int", "regular number = 100"],
  ["variables can be reassigned (ints)", "regular number = 1 number = 50"],
  ["variables can be reassigned (strings)", 'put team = "bears" team = "dogs"'],
  ["variables declaration floats", "decaf decimal = 3.14"],
  ["variables declaration string", 'put name = "Walter White"'],

  ["ternary", "regular name = 6 name == 5 ? 5 : 1"],
  ["||", "brew(true||1<2||false)"],
  ["&&", "brew(true&&1<2&&false)"],
  ["relation", "brew(1<=2 && 3.5<1.2)"],

  ["return with +", "cup regular name -> (regular x) {complete x + 9}"],
  ["return with -", "cup regular name -> (regular x) {complete x - 9}"],
  ["return with *", "cup regular name -> (regular x) {complete x * 9}"],
  ["return with /", "cup regular name -> (regular x) {complete x / 9}"],
  ["return with %", "cup regular name -> (regular x) {complete x % 9}"],

  ["built-in pi", "brew(π)"],
  ["built-in sqrt", "brew(sqrt(π))"],
  ["built-in exp", "brew(exp(9.0))"],
  ["built-in sin", "brew(sin(π))"],
  ["built-in cos", "brew(cos(93.999))"],
  ["function assign put", 'cup regular add -> (decaf x, decaf y) {brew("Hi")}'],
  ["short if", "decaf money = 5.1 sugar (money < 6.0) {brew(money)}"],
  ["long if", "sugar(true) {brew(1)} cream {brew(3)}"],
  [
    "long if else",
    "sugar(true) {brew(1)} cream sugar (true) {brew(2)} cream {brew(3)}"
  ],

  ["while works false", "while(false){decaf cows = 5.0}"],
  ["while works true", "while(true){decaf cows = 5.0}"],

  ["increment works", "regular i = 10 i++"],
  ["decrement works", "regular i = 20 i--"],
  [
    "function works with multiplication and regular",
    "cup regular name -> (regular x) {complete x * 9}"
  ],
  [
    "function works with division and decaf",
    "cup decaf name -> (decaf x) {complete x / 9.2}"
  ],

  [
    "class works",
    "keurig Car {create(self, put name, regular year) {this.name = name this.year = year}}"
  ],

  ["remainder works", "brew(5%2)"],
  ["power works", "brew(2**3)"],
  ["unary expression", "decaf decimal = -5.32"],
  ["equality works", "brew(1 == 1)"],
  ["inequality works", "brew(100 != 100)"],
  ["less than works", "brew(1 < 2)"],
  ["less than or equal works", "brew(1 <= 2)"],
  ["greater than works", "brew(1 > 2)"],
  ["greater than or equal works", "brew(1 >= 2)"],
  ["comment works", "#this is a comment\n"],

  [
    "class works with methods",
    "keurig Person {create(self, put name, regular birthDate) {this.name = name this.birthDate = birthDate} cup put name -> (self, put x) {x}}"
  ]
];

const semanticErrors = [
  ["increment and decrement", 'put x = "Hello" x--', /Expected an integer/],
  [
    "return outside function",
    'complete("return something")',
    /Return can only appear in a function/
  ],
  [
    "creating class with wrong number of arguments",
    'keurig Person {create(self, put name, regular birthDate) {this.name = name this.birthDate = birthDate}}Person p = Person("Jose", 03022002, "blue")'
  ],
  [
    "function with more then required arguments",
    "cup regular multiNine -> (regular x) {complete x * 9} test func = multiNine(1, 2)"
  ],
  [
    "function with less then required arguments",
    "cup regular multiNine -> (regular x) {complete x * 9} test func = multiNine()"
  ],
  ["type with wrong value, number assigned to string", "put x = 5.5"],
  ["type with wrong value, string assigned to number", 'regular x = "hello"'],
  ["using undeclared indentifier", "brew(x)", /Identifier x not declared/],
  [
    "variable used as a function",
    "put x = 5 x()",
    /Cannot assign a regular to a put/
  ],
  [
    "redeclaring variable",
    'put x = "five" put x = "six"',
    /Identifier x already declared/
  ],
  ["subtracting string from number", 'brew(5 - "hello")'],
  ["adding string to number", 'brew(5 + "hello")'],
  [
    "haven't declared type for identifier",
    'name = "Jose"',
    /Identifier name not declared/
  ]
];

describe("The analyzer", () => {
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(source));
    });
  }

  for (const [scenario, source, errorMessagePattern] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(source), errorMessagePattern);
    });
  }

  it(`builds an unoptimized AST for a simple program`, () => {
    const ast = analyze("brew(1 + 3)");
    assert.equal(ast.statements.length, 1);
    assert.equal(ast.statements[0].type, "(1 + 3)");
    assert.ok(util.inspect(ast));
  });

  it("throws when calling the error function", () => {
    assert.throws(() => error("Oops"));
    assert.throws(() =>
      error("message", { source: { getLineAndColumnMessage: () => {} } })
    );
  });

  it("does check function", () => {
    assert.throws(() => check());
  });

  it("throws on syntax error", () => {
    assert.throws(() => analyze(")asdfrfron@&*^*&^*&^*"));
  });
});
