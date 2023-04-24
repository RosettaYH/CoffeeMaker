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
];

describe("The code generator", () => {
    for (const fixture of fixtures) {
        it(`produces expected js output for the ${fixture.name} program`, () => {
            const actual = generate(analyze(fixture.source));
            assert.deepEqual(actual, fixture.expected);
        });
    }
});
