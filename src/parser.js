import * as fs from "node:fs";
import ohm from "ohm-js";

const grammar = ohm.grammar(fs.readFileSync("src/coffeemaker.ohm"));

export default function parse(sourceCode) {
  const match = grammar.match(sourceCode);
  if (!match.succeeded()) throw new Error(match.message);
  return match;
}
