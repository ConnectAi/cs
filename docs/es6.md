## ES6 Goodies

We have access to many killer ES6 features...
`let`'s use them!

```js
// expand and object into variables
let { a, b, c } = myObjectWith3Keys;


// expand and array into variables
let [ a, b, c ] = myArrayWith3Indecies;


// use let as a temp variable
for (let i = 0; i <= thing; i++) {
	// ...
}


// loop through properties of mine not my prototypes
for (let key of object) {
	// ...
}


// keeping the parent 'this' scope (and not having to write 'function'
let myFunc = (some, params) => {
	// my 'this' has not changed scope
}


// template literals.  You can have variables and JS inside a string!
let coolString = `Happy ${3 + .14} ${day}`;


// Default arguments
let speak(greeting = "hello", recipient = "world") {
	return `${greeting} ${recipient}!`;
};


// no need to repeat keys and values in object if identical
let foo = function() {
	let one = 1, two = 2, three = 3;

	return {
		// the redundancy hurts!
		one: one,
		// the new hawtness
		two,
		three
	};
};
```


## Destructuring

```js
// Passing an array to a function?
let destructuringArray = function([one, two, three]) {
	// one, two and three are now variables
	console.log(one, two, three);
};

destructuringArray(["foo", "bar", "baz"]);


// Objects are people, too
let destructuringObject = function({ first, last, dob: birthDate }) {
	// NOTE: you can even rename keys, like `dob` => `birthDate`
	console.log(first, last, birthDate);
};

destructuringObject({
	first: "Holdan",
	last: "Caufield",
	dob: new Date(1980, 10, 20)
});
```


## Promises

Because NodeJS is event based, you have 3 options to handle code that "blocks".

- Callbacks
- Events
- Promises

A callback is simple. Your function requires that the user pass in a function that will run when your thing is done.
But that can get really messy.


### Then

All models return promises, because database stuff is blocking.

```js
app.models.user.findById(5)
	.then(function(user) {
		console.log(user);
	});
```


### Rejection

```js
app.models.user.findById(5)
	.then(function(user) {
		console.log(user);
	}, function(err) {
		console.log(err);
	});
```

> The 2nd param to then is the rejection function.
> If a promise is rejection, this will get called.


### Dependent Thens

What about doing another database call that depends on users?

```js
// we make our first db call
app.models.user.findById(5)
	// we then use that result
	.then(function(user) {
		// we return from the then function with a NEW promise
		// again, all database functions return promises
		return app.models.user.getAge(user.id);
	})
	// now we do something with the result of THAT promise
	.then(function(age) {
		console.log(age);
	});
```

> Moral: You can .then() as much as you want, as long as you keep returning.  Whatever you return, promise or not promise, will be passsed to the next then(). You can only pass 1 thing however.


### Wait for all

```js
// both of these database methods return promises
let uPromise = app.models.users.findAll();
let sPromise = app.models.scripts.findAll();

// Promise.all will wait till all of them are done
Promise.all([uPromise, sPromise]).then(function([users, scripts]) {
	console.log(users,scripts);
});
```

> Note that we have to deconstruct the array in the then() function because then always only takes 1 argument.  See above ES6 notes for deconstructing


### Wrap something that uses callbacks

```js
let request = require("request");
let myFunction(url) = {
	return new Promise(function(resolve, reject)) {
		request(url, function (error, response, body) {
			if (error) reject(error);
			else resolve(body);
		});
	});
}
```

> Moral: we are just gonna return a promise from our function. Makes sense.  So we just wrap it in new Promise(). Then we just resolve() or reject() with whatever SINGLE value we want.


### Conditional Promise

```js
let promise;

// if we actually had any files to upload
if (req.files) {
	promise = app.services.upload(req.files, "/images");
} else {
	promise = Promise.cast(false);
}

// go ahead with normal activity
promise.then(function(images) {
	if (images) {};
});
```

> Moral: If you want to ensure using a .then() you can cast anything to a promise and it becomes thenable.
