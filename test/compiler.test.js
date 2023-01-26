import assert from "assert";
import { add, subtract } from "../src/coffeemaker.js";

describe("The compiler", function () {
    it("gives the correct values for the add function", function () {
        assert.equal(add(5, 8), 13);
        assert.equal(add(5, -8), -3);
    });
    it("gives the correct values for the subtract function", function () {
        assert.equal(subtract(5, 8), -3);
    });
});
