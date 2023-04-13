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
    `
  },
  {
    name: "if",
    source: `
      regular x = 0
      sugar (x == 0) { brew("1") }
      sugar (x == 0) { brew(1) } no sugar { brew(2) }
      sugar (x == 0) { brew(1) } salt (x == 2) { brew(3) }
      sugar (x == 0) { brew(1) } salt (x == 2) { brew(3) } no sugar { brew(4) }
    `,
    expected: dedent`
      let x_1 = 0;
      if ((x_1 === 0)) {
        console.log("1");
      }
      if ((x_1 === 0)) {
        console.log(1);
      } else {
        console.log(2);
      }
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
        }
    `
  },
  {
    name: "while",
    source: `
      regular x = 0
      while(x < 5) {
        regular y = 0
        while(y < 5) {
          brew (x * y)
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
    name: "functions",
    source: `
      decaf z = 0.5
      cup regular f -> (x,y) {
        brew(sin(x) > π)
        complete(0)
      }
      cup boolean g -> () {
        complete(false)
      }
      f(z, g())
    `,
    expected: dedent`
      let z_1 = 0.5;
      function f_2(x_3, y_4) {
        console.log((Math.sin(x_3) > Math.PI));
        return(0);
      }
      function g_5() {
        return false;
      }
      f_2(z_1, g_5());
    `
  },
  {
    name: "classes",
    source: `
      keurig S {
          create (self, x) {
              this.x = x
          }
          cup regular getX -> (self, x) {
              complete(self.x)
          }
      }
      let x = new S(3)
      brew(x.getX())
    `,
    expected: dedent`
      class S_1 {
        constructor(x_2) {
          this["x_3"] = x_2;
        }
        getX_4() {
          return this["x_3"];
        }
      }
      let x_5 = new S_1(3);
      console.log(x_5.getX_4());
    `
  },
  {
    name: "for loops",
    source: `
      for i in 1..<50 {
        brew(i);
      }
      for j in [10, 20, 30] {
        print(j);
      }
      repeat 3 {
        // hello
      }
      for k in 1...10 {
      }
    `,
    expected: dedent`
      for (let i_1 = 1; i_1 < 50; i_1++) {
        console.log(i_1);
      }
      for (let j_2 of [10,20,30]) {
        console.log(j_2);
      }
      for (let i_3 = 0; i_3 < 3; i_3++) {
      }
      for (let k_4 = 1; k_4 <= 10; k_4++) {
      }
    `
  },
  {
    name: "standard library",
    source: `
      let x = 0.5;
      print(sin(x) - cos(x) + exp(x) * ln(x) / hypot(2.3, x));
      print(bytes("∞§¶•"));
      print(codepoints("💪🏽💪🏽🖖👩🏾💁🏽‍♀️"));
    `,
    expected: dedent`
      let x_1 = 0.5;
      console.log(((Math.sin(x_1) - Math.cos(x_1)) + ((Math.exp(x_1) * Math.log(x_1)) / Math.hypot(2.3,x_1))));
      console.log([...Buffer.from("∞§¶•", "utf8")]);
      console.log([...("💪🏽💪🏽🖖👩🏾💁🏽‍♀️")].map(s=>s.codePointAt(0)));
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
