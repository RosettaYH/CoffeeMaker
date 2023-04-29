import assert from "node:assert/strict";
import analyze from "../src/analyzer.js";
import generate from "../src/generator.js";

function dedent(s) {
  return `${s}`.replace(/(?<=\n)\s+/g, "").trim();
}

const fixtures = [
  {
    name: "var dec, increment, decrement",
    source: `
      	regular x = 3 * 7
      	x++
      	x--
    `,
    expected: dedent`
      	let x_1 = (3 * 7);
      	x_1++;
      	x_1--;
    `
  },
  {
    name: "while",
    source: `
      	regular x = 0 
		while x < 5 {
			regular y = 0 
			while y < 5 {
				brew(x * y) 
				y = y + 1
			} 
			x = x + 1
		}
    `,
    expected: dedent`
      	let x_1 = 0;
      	while ((x_1 < 5)) {
        	let y_2 = 0;
        	while ((y_2 < 5)) {
          		console.log((x_1 * y_2));
          		y_2 = (y_2 + 1);
        	}
        	x_1 = (x_1 + 1);
      }
    `
  },
  {
    name: "ternary",
    source: `
		brew(6 == 5 ? 5 : 1)
		`,
    expected: dedent`
		console.log((((6 === 5)) ? (5) : (1)));
		`
  },
  {
    name: "unary",
    source: `
		decaf x = -5.76`,

    expected: dedent`
		let x_1 = -(5.76);`
  },
  {
    name: "boolean",
    source: `
		boolean x = true
		boolean y = false
		boolean z = x && y`,
    expected: dedent`
		let x_1 = true;
		let y_2 = false;
		let z_3 = (x_1 && y_2);`
  },
  {
    name: "function",
    source: `
		cup regular name -> (regular x) {
			complete x * 9
		}
		name(5)`,
    expected: dedent`
		function name_2(x_1) {
			return (x_1 * 9);
		}
		name_2(5);`
  },
  {
    name: "short if",
    source: `
		decaf money = 5.1 
		sugar (money < 6.2) {
			brew(money)
		}`,
    expected: dedent`
		let money_1 = 5.1;
		if ((money_1 < 6.2)) {
			console.log(money_1);
		}`
  },

  {
    name: "if with else if",
    source: `
		regular x = 0
		sugar (x == 0) { brew(1) } cream sugar (x == 2) { brew(3) }
      	sugar (x == 0) { brew(1) } cream sugar (x == 2) { brew(3) } cream { brew(4) }`,
    expected: dedent`
		let x_1 = 0;
      	if ((x_1 === 0)) {
        	console.log(1);
      	} else {
        	if ((x_1 === 2)) {
          	console.log(3);
        	}
      	}
      	if ((x_1 === 0)) {
        	console.log(1);
      	} else
        	if ((x_1 === 2)) {
          	console.log(3);
        	} else {
          	console.log(4);
        }`
  },
  {
    name: "if with just else",
    source: `
		regular x = 5
		regular y = 6
		sugar (x < y) {
			brew(x)
		} cream {
			brew(y)
		}`,
    expected: dedent`
		let x_1 = 5;
		let y_2 = 6;
		if ((x_1 < y_2)) {
			console.log(x_1);
		} else {
			console.log(y_2);
		}`
  },

  {
    name: "class",
    source: `
  		keurig Person {
  			create(self, put name, regular birthDate) {
  				this.name = name
  				this.birthDate = birthDate
  			}
  			cup put name -> (self, put x) {
  				complete x
  			}
  		}`,

    expected: dedent`
  		class Person_1 {
  			constructor(name_2, birthDate_3) {
  				this.name_2 = name_2;
  				this.birthDate_3 = birthDate_3;
  			}
  			name_5(x_4) {
  				return x_4;
  			}
  		}`
  },
  {
    name: "print with strings",
    source: `
		brew("hello world")`,
    expected: dedent`
		console.log("hello world");`
  },
  {
    name: "standard functions",
    source: `
		decaf x = 5.3
		brew(sin(x))
		brew(cos(x))
		brew(exp(x))
		brew(ln(x))
		`,
    expected: dedent`
		let x_1 = 5.3;
		console.log(Math.sin(x_1));
		console.log(Math.cos(x_1));
		console.log(Math.exp(x_1));
		console.log(Math.log(x_1));
		`
  }
];

describe("The code generator", () => {
  for (const fixture of fixtures) {
    it(`produces expected js output for the ${fixture.name} program`, () => {
      const actual = generate(analyze(fixture.source));
      assert.deepEqual(actual, fixture.expected);
    });
  }
});
