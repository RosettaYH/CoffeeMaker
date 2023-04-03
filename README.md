<img src=./docs/imgs/logo.jpg width="300" height="300">

# [CoffeeMaker](https://rosettayh.github.io/CoffeeMaker/)

## Introduction

Welcome, all coffee lovers! Haven’t fully clenched your taste buds with coffee? Do you need that little bit of extra caffeine to get you going through the morning or night? Want to be able to go to Starbucks or Dunkin Donuts or any of your favorite coffee shops? You are in the right place with our coffeemaker language here! Ready to recreate Espresso, Macchiato, Americano, Latte, Cappuccino, and the others that come to your mind? After a few minutes in our coffeemaker, you will be able to create and taste your very own coffee! Are you ready to replicate or even surpass the “great” Starbucks? Check out our site here: https://rosettayh.github.io/CoffeeMaker/

## Features

-   Statically typed language
-   Coffee-themed
-   Loops
-   Classes

## Types

<table>
  <tr>
    <th>Java</th>
    <th>CoffeeMaker</th>
  </tr>
  <tr>
    <td>let</td>
    <td>put (for strings)</td>
	<td>regular (for numbers)</td>
	<td>decaf (for decimals)</td>
  </tr>
  <tr>
    <td>function</td>
    <td>cup</td>
  </tr>
</table>

## Other Keywords

<table>
  <tr>
    <th>Javascript</th>
    <th>CoffeeMaker</th>
  </tr>
  <tr>
    <td>function</td>
    <td>cup</td>
  </tr>
  <tr>
    <td>for</td>
    <td>stir</td>
  </tr>
  <tr>
    <td>if</td>
    <td>sugar</td>
  </tr>
  <tr>
    <td>else if</td>
    <td>salt</td>
  </tr>
  <tr>
    <td>else</td>
    <td>no salt</td>
  </tr>
</table>

## Examples

### Printing

<table>
<tr> <th>JavaScript</th><th>CoffeeMaker</th><tr>
</tr>
<td>

```javascript
console.log(“A cup of coffee”)
```

</td>

<td>

```
 brew(“A cup of coffee”)
```

</td>
</table>

### Assigning and Intiliazing

<table>
<tr> <th>JavaScript</th><th>CoffeeMaker</th><tr>
</tr>
<td>

```javascript
let number = 100;
const name = "Walter White";
var boss = "Gus Fring"; //OH NO, NOT var! :(
// two slashes is a comment in javascript
```

</td>

<td>

```
 regular number = 100 	#for numbers/integers
 decaf decimal = 3.14 	#for floats
 put name = "Walter White" 	#for Strings
 # the pound (hash) is a comment in CoffeeMaker
```

</td>
</table>

### Loops

<table>
<tr> <th>JavaScript</th><th>CoffeeMaker</th><tr>
</tr>
<td>

```javascript
for (let i = 0; i < 10; i++) {
    print("I love compilers!");
}
```

</td>

<td>

```
regular i = 4
while(i < 10){
	brew("I love to sleep!")
	i = i + 1
}
```

</td>
</table>

### Conditionals (If-Statement)

<table>
<tr> <th>JavaScript</th><th>CoffeeMaker</th><tr>
</tr>
<td>

```javascript
if (age < 18) {
    console.log("Enjoy your early years!");
} else if (age > 60) {
    console.log("Retirement age is finally here!");
} else {
    console.log("Errr, good luck in adulthood :p");
}
```

</td>

<td>

```
sugar (age < 18) {
    brew("Enjoy your early years!")
} salt(age > 60) {
    brew("Retirement age is finally here!")
} no sugar {
    brew("Errr, good luck in adulthood :p")
}
```

</td>
</table>

### Functions

<table>
<tr> <th>JavaScript</th><th>CoffeeMaker</th><tr>
</tr>
<td>

```javascript
function add(x, y) {
    return x + y;
}
```

</td>

<td>

```
cup regular add -> (x, y) {
    complete(x + y)
}
```

</td>
</table>

### Classes

<table>
<tr> <th>JavaScript</th><th>CoffeeMaker</th><tr>
</tr>
<td>

```javascript
class Car {
    constructor(name, year) {
        this.name = name;
        this.year = year;
    }

    function add(x, y) {
         return x + y;
    }
}
```

</td>

<td>

```
keurig Car {
    create(self, name, year) {
        this.name = name
        this.year = year
    }
    
    cup regular add -> (self, x, y) {
         complete(x + y)
    }
}
```

</td>
</table>

## List of Static Semantic Errors
- Use of undeclared identifiers.
- Variable used as a function.
- Redeclaring an already declared identifier.
- Value returned outside of function.
- decrementing/incrementing a string
- function with more arguments then allowed
- wrong types for identifiers 
- return in just inside if statement 
- for loop with no body 
- Variable used within a loop is declared and initialized outside of the loop.

#### Authors: Rosetta Yu and Jose Fuentes
