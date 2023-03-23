import { Type, FunctionType, Variable, Function } from "./core.js";

const floatFloatType = new FunctionType([Type.FLOAT], Type.FLOAT);
const floatFloatFloatType = new FunctionType(
  [Type.FLOAT, Type.FLOAT],
  Type.FLOAT
);

export const contents = Object.freeze({
  regular: Type.INT,
  decaf: Type.FLOAT,
  boolean: Type.BOOLEAN,
  put: Type.STRING,
  void: Type.VOID,
  π: new Variable("π", true, Type.FLOAT),
  //   print: new Function("brew", new FunctionType([Type.ANY], Type.VOID)),
  sin: new Function("sin", floatFloatType),
  cos: new Function("cos", floatFloatType),
  exp: new Function("exp", floatFloatType),
  ln: new Function("ln", floatFloatType),
  sqrt: new Function("sqrt", floatFloatType),
  hypot: new Function("hypot", floatFloatFloatType)
});
