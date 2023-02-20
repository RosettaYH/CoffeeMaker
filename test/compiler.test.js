import assert from "assert/strict";
import util from "util";
import compile from "../src/compiler.js";

const sampleProgram = 'brew("A cup of coffee")';

describe("The compiler", () => {
  it("throws when the output type is unknown", (done) => {
    assert.throws(
      () => compile("brew(“A cup of coffee”)", "blah"),
      /Unknown output type/
    );
    done();
  });
  it("accepts the analyzed option", (done) => {
    const compiled = compile(sampleProgram, "analyzed");
    // assert(util.format(compiled).startsWith("   1 | Program"));
    done();
  });
  //   it("accepts the optimized option", (done) => {
  //     const compiled = compile(sampleProgram, "optimized");
  //     assert(util.format(compiled).startsWith("   1 | Program"));
  //     done();
  //   });
  //   it("generates js code when given the js option", (done) => {
  //     const compiled = compile(sampleProgram, "js");
  //     assert(util.format(compiled).startsWith("console.log(0)"));
  //     done();
  //   });
});
