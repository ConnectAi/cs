## ES6 Goodies
Hey we have ES6, `let`'s use it

    // expand and object into variables
    var {a, b, c} = myObjectWith3Keys;


    // expand and array into variables
    var [a, b, c] = myArrayWith3Indecies;


    // use let as a temp variable
    for(let i = 0; i <= thing; i++) {}


    // loop through properties of mine not my prototypes
    for(let key of object) {}


    // keeping the parent 'this' scope (and not having to write 'function'
    var myFunc = (some, params) => {
        // my 'this' has not changed scope
    }

    // quasi literals.  You can have variables and JS inside a string!
    var coolString = `Happy ${3 + .14} ${day}`;


    // Default arguments
    var speak(greeting = "hello", recipient = "world") {
        return `${greeting} ${recipient}!`;
    };


    // no need to repeat keys and values in object if identical
    var one = 1, two = 2, three = 3;
    function foo() {
        return {
            one: one, 	// no longer necessary
         	two,       	// good to go
            three
        }
    }
    
    // Passing an array to a function?
    function ([one, two, three]) {
    	// one, two and three are now variables
    }