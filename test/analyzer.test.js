import util from "util";
import assert from "assert/strict";
import analyze from "../src/analyzer.js";

const sample = `
				regular x=sqrt(9) 
				x = 10
				regular dog = -(6**3)
				sugar (dog < 10 || dog > 100) {brew("I love dogs!")}
				decaf decimal = 4.5
				sugar (decimal < 5 && decimal > 1){brew("Still have health!")} no sugar {brew("No more health!")} 
				cup regular multiThree -> (x) {complete 3 * x} 
				while(false){decaf cows = 5}
				while(true){regular y=3 brew(0?1:2)}
				sugar (x < 18) {brew("Enjoy your early years!")} salt(x > 60) {brew("Retirement age is finally here!")}salt(x > 100) {brew("Great Job!")} no sugar {brew("Errr, good luck in adulthood :p")}
				decaf money = 5.1 sugar (money < 6.0) {complete(money)}
				keurig Car {create(self, name, year) {this.name = name this.year = year} cup regular add -> (self, x, y) {complete(x + y)} 
			}`;

const expected = `   1 | Program statements=[#2,#6,#7,#11,#16,#18,#23,#28,#31,#36,#40,#42,#45]
   2 | VariableDeclaration variable=#3 initializer=#4
   3 | Variable name='x' readOnly=false
   4 | Call callee=#5 args=[9]
   5 | Function name='sqrt' paramCount=1 readOnly=true
   6 | Assignment target=#3 source=10
   7 | VariableDeclaration variable=#8 initializer=#9
   8 | Variable name='dog' readOnly=false
   9 | UnaryExpression op='-' operand=#10
  10 | BinaryExpression op='**' left=6 right=3
  11 | IfStatement test=#12 consequent=[#15] alternate=undefined
  12 | BinaryExpression op='||' left=#13 right=#14
  13 | BinaryExpression op='<' left=#8 right=10
  14 | BinaryExpression op='>' left=#8 right=100
  15 | PrintStatement argument='"I love dogs!"'
  16 | VariableDeclaration variable=#17 initializer=4.5
  17 | Variable name='decimal' readOnly=false
  18 | IfStatement test=#19 consequent=[#22] alternate=undefined
  19 | BinaryExpression op='&&' left=#20 right=#21
  20 | BinaryExpression op='<' left=#17 right=5
  21 | BinaryExpression op='>' left=#17 right=1
  22 | PrintStatement argument='"Still have health!"'
  23 | FunctionDeclaration fun=#24 params=[#25] body=[#26]
  24 | Function name='multiThree' paramCount=1 readOnly=true
  25 | Variable name='x' readOnly=true
  26 | ReturnStatement expression=#27
  27 | BinaryExpression op='*' left=3 right=#25
  28 | WhileStatement test=false body=[#29]
  29 | VariableDeclaration variable=#30 initializer=5
  30 | Variable name='cows' readOnly=false
  31 | WhileStatement test=true body=[#32,#34]
  32 | VariableDeclaration variable=#33 initializer=3
  33 | Variable name='y' readOnly=false
  34 | PrintStatement argument=#35
  35 | Conditional test=0 consequent=1 alternate=2
  36 | IfStatement test='0' consequent=[#37,#38] alternate=undefined
  37 | BinaryExpression op='>' left=#3 right=60
  38 | Array 0=#39
  39 | PrintStatement argument='"Retirement age is finally here!"'
  40 | VariableDeclaration variable=#41 initializer=5.1
  41 | Variable name='money' readOnly=false
  42 | IfStatement test=#43 consequent=[#44] alternate=undefined
  43 | BinaryExpression op='<' left=#41 right=6
  44 | ReturnStatement expression=#41
  45 | ClassDeclaration id=#46 constructorDec=#47 methods=[#50]
  46 | Class name='Car' readOnly=true
  47 | ConstructorDeclaration parameters=[#48,#49] body='}'
  48 | Variable name='name' readOnly=true
  49 | Variable name='year' readOnly=true
  50 | MethodDeclaration name=#51 params=[#52,#53] body=[#54]
  51 | Function name='add' paramCount=2 readOnly=true
  52 | Variable name='x' readOnly=true
  53 | Variable name='y' readOnly=true
  54 | ReturnStatement expression=#55
  55 | BinaryExpression op='+' left=#52 right=#53`;

describe("The analyzer", () => {
    it(`produces the expected graph for the simple sample program`, () => {
        assert.deepEqual(util.format(analyze(sample)), expected);
    });
});
