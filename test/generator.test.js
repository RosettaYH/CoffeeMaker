import assert from "node:assert/strict";
import parse from "../src/parser.js";
import analyze from "../src/analyzer.js";
import optimize from "../src/optimizer.js";
import generate from "../src/generator.js";

function dedent(s) {
    return `${s}`.replace(/(?<=\n)\s+/g, "").trim();
}

const fixtures = [
    {
        name: "small",
        source: `
      	regular x = 3 * 7
      	x++
      	x--
    `,
        expected: dedent`
      	let x_1 = (3 * 7);
      	x_1++;
      	x_1--;
    `,
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
          		console.log((x_1 * y_2))
          		y_2 = (y_2 + 1);
        	}
        	x_1 = (x_1 + 1);
      }
    `,
    },
    {
        name: "ternary",
        source: `
		brew(6 == 5 ? 5 : 1)
		`,
        expected: dedent`
		console.log((((6 === 5)) ? (5) : (1)))
		`,
    },
    {
        name: "unary",
        source: `
		decaf x = -5.76`,

        expected: dedent`
		let x_1 = -(5.76);`,
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
		let z_3 = (x_1 && y_2);`,
    },
    //------------------------------------------------------------------ BELOW DOESNT WORK
    {
        name: "function",
        source: `
		cup regular name -> (regular x) {
			complete x * 9
		}
		name(5)`,
        expected: dedent`
		function name_1(x_1) {
			return (x_1 * 9);
		}
		name_1(5);`,
    },
    {
        name: "for",
        source: `
		stir(regular i = 0; i < 10; i++) {
			regular cows = 2 + i
		}`,

        expected: dedent`
		for(i_1 = 0; i_1 < 10; i_1++) {
			let cows_2 = (2 + i_1);
		}`,
    },
    {
        name: "short if",
        source: `
		decaf money = 5.1 
		sugar (money < 6.0) {
			brew(money)
		}`,
        expected: dedent`
		let money_1 = 5.1;
		if ((money_1 < 6.0)) {
			console.log(money_1);
		}`,
    },

	{
		name: "long if",
		source: `
		regular x = 5
		regular y = 6
		regular z = 7
		sugar (x < y) {
			brew(x)
		} salt (y < z) {
			brew(y)
		} salt (z < x) {
			brew(z)
		} no sugar {
			brew(0)
		}`,
		expected: dedent`
		let x_1 = 5;
		let y_2 = 6;
		let z_3 = 7;
		if ((x_1 < y_2)) {
			console.log(x_1);
		} else if ((y_2 < z_3)) {
			console.log(y_2);
		} else if ((z_3 < x_1)) {
			console.log(z_3);
		} else {
			console.log(0);
		}`,
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
				this.name = name_2;
				this.birthDate = birthDate_3;
			}
			name_2(x_4) {
				return x_4;
			}
		}`,
    },
];

describe("The code generator", () => {
    for (const fixture of fixtures) {
        it(`produces expected js output for the ${fixture.name} program`, () => {
            const actual = generate(analyze(fixture.source));
            assert.deepEqual(actual, fixture.expected);
        });
    }
});
