import util from "util";
import assert from "assert/strict";
import analyze, { error, check } from "../src/analyzer.js";

const semanticChecks = [
    ["variables can be printed", 'brew("A cup of coffee")'], //this works
    ["variables declaration int", "regular number = 100"], //this works
    ["variables can be reassigned (ints)", "regular number = 1 number = 50"], //this works
    [
        "variables can be reassigned (strings)",
        'put team = "bears" team = "dogs"',
    ], //this works
    ["variables declaration floats", "decaf decimal = 3.14"], //this works
    ["variables declaration string", 'put name = "Walter White"'], //this works

    ["ternary", "regular name = 6 name == 5 ? 5 : 1"], //this works
    ["||", "brew(true||1<2||false)"], //this works
    ["&&", "brew(true&&1<2&&false)"], //this works
    ["relation", "brew(1<=2 && 3.5<1.2)"], //this works

    ["return with +", "cup regular name -> (regular x) {complete x + 9}"], //this works
    ["return with -", "cup regular name -> (regular x) {complete x - 9}"], //this works
    ["return with *", "cup regular name -> (regular x) {complete x * 9}"], //this works
    ["return with /", "cup regular name -> (regular x) {complete x / 9}"], //this works
    ["return with %", "cup regular name -> (regular x) {complete x % 9}"], //this works

    ["built-in pi", "brew(π)"], //this works
    ["built-in sqrt", "brew(sqrt(π))"], //this works
    ["built-in exp", "brew(exp(9.0))"], //this works
    ["built-in sin", "brew(sin(π))"], //this works
    ["built-in cos", "brew(cos(93.999))"], //this works
    [
        "function assign put",
        'cup regular add -> (decaf x, decaf y) {brew("Hi")}',
    ], // this works
    ["short if", "decaf money = 5.1 sugar (money < 6.0) {brew(money)}"], //this works
    [
        "long if",
        'regular age = 0 sugar (age < 18) {brew("Enjoy your early years!")} salt(age > 60) {brew("Retirement age is finally here!")} salt(age > 100) {brew("Great Job!")} no sugar {brew("Errr, good luck in adulthood :p")}',
    ], //this works

    ["while works false", "while(false){decaf cows = 5.0}"], // this works
    ["while works true", "while(true){decaf cows = 5.0}"], // this works

    //this works
    ["for works", "stir(regular i = 0; i < 10; i++){regular cows = 2 + i}"],

    ["increment works", "regular i = 10 i++"], //this works
    ["decrement works", "regular i = 20 i--"], //this works
    [
        "function works with multiplication and regular",
        "cup regular name -> (regular x) {complete x * 9}",
    ], //this works
    [
        "function works with division and decaf",
        "cup decaf name -> (decaf x) {complete x / 9.2}",
    ], //this works

    [
        "class works",
        "keurig Car {create(self, put name, regular year) {this.name = name this.year = year}}",
    ], //this works

    ["simple if statement", "regular x = 5 sugar (x < 10) {brew(x)}"], //this works
    [
        "if with else works",
        "regular x = 5 sugar (x < 10) {brew(x)} no sugar {brew(10)}", //this works
    ],

    [
        "if with else if and else works",
        "regular x = 5 sugar (x < 10) {brew(x)} salt (x > 10) {brew(10)} no sugar {brew(20)}", //this works
    ],

    [
        "if with multiple else if works", //this works
        'regular age = 0 sugar (age < 18) {brew("Enjoy your early years!")} salt(age > 60) {brew("Retirement age is finally here!")} salt(age > 100) {brew("Great Job!")} no sugar {brew("Errr, good luck in adulthood :p")}',
    ],
    ["remainder works", "brew(5%2)"], //this works
	["power works", "brew(2**3)"], //this works
    ["unary expression", "decaf decimal = -5.32"], //this works
    ["equality works", "brew(1 == 1)"], //this works
    ["inequality works", "brew(100 != 100)"], //this works
    ["less than works", "brew(1 < 2)"], //this works
    ["less than or equal works", "brew(1 <= 2)"], //this works
    ["greater than works", "brew(1 > 2)"], //this works
    ["greater than or equal works", "brew(1 >= 2)"], //this works
    ["comment works", "#this is a comment\n"], //this works

    //this works
    [
        "class works with methods",
        "keurig Person {create(self, put name, regular birthDate) {this.name = name this.birthDate = birthDate} cup put name -> (self, put x) {x}}",
    ],
];

const semanticErrors = [
    ["increment and decrement", 'put x = "Hello" x--', /Expected an integer/], //this works
    [
        //this works
        "return outside function",
        'complete("return something")',
        /Return can only appear in a function/,
    ],
    [
        //this work
        "creating class with wrong number of arguments",
        'keurig Person {create(self, put name, regular birthDate) {this.name = name this.birthDate = birthDate}}Person p = Person("Jose", 03022002, "blue")',
        //Expected 2 arguments but got 3/,
    ],
    [
        //this works
        "function with more then required arguments",
        "cup regular multiNine -> (regular x) {complete x * 9} test func = multiNine(1, 2)",
        //1 argument(s) required but 2 passed/,
    ],
    [
        //this work
        "function with less then required arguments",
        "cup regular multiNine -> (regular x) {complete x * 9} test func = multiNine()",
        //1 argument(s) required but 0 passed/,
    ],
    [
        //this work
        "type with wrong value, number assigned to string",
        "put x = 5.5",

    ],
    [
        //this work
        "type with wrong value, string assigned to number",
        'regular x = "hello"',
    ],
    [
        //this works
        "using undeclared indentifier",
        "brew(x)",
        /Identifier x not declared/,
    ],
    [
        //this works
        "variable used as a function",
        "put x = 5 x()",
        /Cannot assign a regular to a put/,
    ],
    [
        //this works
        "redeclaring variable",
        'put x = "five" put x = "six"',
        /Identifier x already declared/,
    ],
    [
        //doesn't works
        "subtracting string from number",
        'brew(5 - "hello")',
        //Expected a number or string/,
    ],
    [
        //doesn't works
        "adding string to number",
        'brew(5 + "hello")',
        //Expected a number or string/,
    ],
    [
        //this works
        "return in an if statement",
        "regular x = 5 sugar (x < 10) {complete x} no sugar {complete 10}",
        /Return can only appear in a function/,
    ],
    [
        //this works
        "haven't declared type for identifier",
        'name = "Jose"',
        /Identifier name not declared/,
    ],

    [	//this works
    	"for loop with no body",
    	"for (regular i = 0; i < 10; i++) { }",
    ],
];

//just type one or a couple near the end (look at carlos to see how its done)
// const sample = `
// 		regular x=sqrt(9)
// 		x = 10
// 		regular dog = -(6**3)
// 		sugar (dog < 10 || dog > 100) {brew("I love dogs!")}
// 		decaf decimal = 4.5
// 		sugar (decimal < 5 && decimal > 1){brew("Still have health!")} no sugar {brew("No more health!")}
// 		cup regular multiThree -> (regular x) {complete 3 * x}
// 		while(false){decaf cows = 5}
// 		while(true){regular y=3 brew(0?1:2)}
// 		sugar (x < 18) {brew("Enjoy your early years!")} salt(x > 60) {brew("Retirement age is finally here!")}salt(x > 100) {brew("Great Job!")} no sugar {brew("Errr, good luck in adulthood :p")}
// 		decaf money = 5.1 sugar (money < 6.0) {complete money}
// 		keurig Car {create(self, put name, regular year) {this.name = name this.year = year} cup regular add -> (self, regular x, regular y) {complete x + y}
// 		}`;

// won't need this i believe
// const expected = `   1 | Program statements=[#2,#6,#7,#11,#16,#18,#23,#28,#31,#36,#40,#42,#45]
//    2 | VariableDeclaration variable=#3 initializer=#4
//    3 | Variable name='x' readOnly=false
//    4 | Call callee=#5 args=[9]
//    5 | Function name='sqrt' paramCount=1 readOnly=true
//    6 | Assignment target=#3 source=10
//    7 | VariableDeclaration variable=#8 initializer=#9
//    8 | Variable name='dog' readOnly=false
//    9 | UnaryExpression op='-' operand=#10
//   10 | BinaryExpression op='**' left=6 right=3
//   11 | IfStatement test=#12 consequent=[#15] alternate=undefined
//   12 | BinaryExpression op='||' left=#13 right=#14
//   13 | BinaryExpression op='<' left=#8 right=10
//   14 | BinaryExpression op='>' left=#8 right=100
//   15 | PrintStatement argument='"I love dogs!"'
//   16 | VariableDeclaration variable=#17 initializer=4.5
//   17 | Variable name='decimal' readOnly=false
//   18 | IfStatement test=#19 consequent=[#22] alternate=undefined
//   19 | BinaryExpression op='&&' left=#20 right=#21
//   20 | BinaryExpression op='<' left=#17 right=5
//   21 | BinaryExpression op='>' left=#17 right=1
//   22 | PrintStatement argument='"Still have health!"'
//   23 | FunctionDeclaration fun=#24 params=[#25] body=[#26]
//   24 | Function name='multiThree' paramCount=1 readOnly=true
//   25 | Variable name='x' readOnly=true
//   26 | ReturnStatement expression=#27
//   27 | BinaryExpression op='*' left=3 right=#25
//   28 | WhileStatement test=false body=[#29]
//   29 | VariableDeclaration variable=#30 initializer=5
//   30 | Variable name='cows' readOnly=false
//   31 | WhileStatement test=true body=[#32,#34]
//   32 | VariableDeclaration variable=#33 initializer=3
//   33 | Variable name='y' readOnly=false
//   34 | PrintStatement argument=#35
//   35 | Conditional test=0 consequent=1 alternate=2
//   36 | IfStatement test='0' consequent=[#37,#38] alternate=undefined
//   37 | BinaryExpression op='>' left=#3 right=60
//   38 | Array 0=#39
//   39 | PrintStatement argument='"Retirement age is finally here!"'
//   40 | VariableDeclaration variable=#41 initializer=5.1
//   41 | Variable name='money' readOnly=false
//   42 | IfStatement test=#43 consequent=[#44] alternate=undefined
//   43 | BinaryExpression op='<' left=#41 right=6
//   44 | ReturnStatement expression=#41
//   45 | ClassDeclaration id=#46 constructorDec=#47 methods=[#50]
//   46 | Class name='Car' readOnly=true
//   47 | ConstructorDeclaration parameters=[#48,#49] body='}'
//   48 | Variable name='name' readOnly=true
//   49 | Variable name='year' readOnly=true
//   50 | MethodDeclaration name=#51 params=[#52,#53] body=[#54]
//   51 | Function name='add' paramCount=2 readOnly=true
//   52 | Variable name='x' readOnly=true
//   53 | Variable name='y' readOnly=true
//   54 | ReturnStatement expression=#55
//   55 | BinaryExpression op='+' left=#52 right=#53`;

//describe("The analyzer", () => {
//    it(`produces the expected graph for the simple sample program`, () => {
//        assert.deepEqual(util.format(analyze(sample)), expected);
//    });
//});

describe("The analyzer", () => {
	// does the semantic checks
    for (const [scenario, source] of semanticChecks) {
        it(`recognizes ${scenario}`, () => {
            assert.ok(analyze(source));
        });
    }

    // does the semantic errors
    for (const [scenario, source, errorMessagePattern] of semanticErrors) {
        it(`throws on ${scenario}`, () => {
            assert.throws(() => analyze(source), errorMessagePattern);
        });
    }

    //(AST stuff)
    it(`builds an unoptimized AST for a simple program`, () => {
    	const ast = analyze("brew(1 + 3)")
		assert.equal(ast.statements.length, 1);
		assert.equal(ast.statements[0].type, "(1 + 3)");
        assert.ok(util.inspect(ast))
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
});
