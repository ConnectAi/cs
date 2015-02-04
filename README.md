# Cornerstone

Web framework built on Node.js.

This node framework is a production-ready Node.js framework that takes advantage of ECMAScript 6 features through the use of [6to5](http://6to5.org/).
It is built on top of [Express](http://expressjs.com).

> View the docs on [controllers](docs/controllers.md) and [views](docs/views.md).


## Requirements

- [Node.js](http://nodejs.org) and [NPM](https://npmjs.org)
- optional:
	- [Redis](http://redis.io/) (for sessions)


## Installation

The idea here is that you have your app in development on Git. Then you'll clone or deploy to your production server, and run CS in production mode.


### Development

```bash
> npm install -g cs
> cs init {{appname}}
> npm install
> cs run
```

### Production

See [production docs](docs/production.md).


## Running

### Development

```bash
> cd {{app dir}}
> cs run
```


### Production

See [production docs](docs/production.md).


## Config

```
config.json
```

- you can make any arbitrary config entries you want
- if you want comments or logic in the config file, you need to change it from .json to .js and then module.exports the object. `module.exports = { ... }`
- Anything outside of the `env` key is the default. Everything inside the `env` key will overwrite those depending on the enviroment you run in.  You run different arbitrary enviroments via `cs run [myapp] [env]`

```json
{
	"name": "appname",
	"port": "8000",
	"session": "redis",
	"debug": false,
	"db": {
		"adapter": "mongodb",
		"mongodb" : {
			"host": "mongodb://localhost:27017/sixtyvocab"
		}
	},
	"env": {
		"production": {
			"port": 80
		},
		"development": {
			"debug": true
		}
	}
}
```


## Directory Structure

```
./controllers
./models
./public
./private
./views
./services
```

- `./public` is your web root.  All static files, js, css, images, etc. go here.
- `./private` is where you put things to be compiled such as stylus, coffeescript, or ES6 files.  By default, stylus files will compile and minify files into public/css automatically.
- `./services` is the location of all services which are basically CS extended functionality


## Debugging

- To run in debug mode, run `> node index` or `> node index development` (`development` is the default environment).
- `./app.log` is a log of all database queries.
- In a view you have `{{log variable}}` to log a hbs variable to the node console
- In a view you have `{{log variable client=true}}` to log a hbs variable to the browser console
- `log()` is a convenient alias to `console.log`.
- In the browser, `CS` is made global.
	- `CS.private` -- all variables available to your view that you passed
	- `CS.public`  -- variables available to your JS files in CS.public
	- `CS.session` -- the session (which is available in your view)
	- `CS.server`  -- server vars (which are available in your view)


## Utilities

### Include

```js
// include and compile a template
var compiledHTML = app.util.include("path/to/file")(data);
```


## Services

Services are a way to share complete parts of CS that are just arbitrary functions.

### Create a service

- Create `services/yourservice/index.js`
- Create a `package.json` defining your attributes and dependecies
- make sure your file `module.exports = ...`
- You can export anything. A function, class an object.

Sample service package.json for gmail service

```json
{
	"name": "gmail",
	"version": "1.0.0",
	"description": "Gmail SMTP sending",
	"main": "gmail.js",
	"keywords": ["gmail","email","smtp"],
	"author": "ConnectAi",
	"license": "BSD-2-Clause",
	"dependencies": {
		"emailjs": "~0.3.5"
	}
}
```

> Currently the services package.json don't do anything


## ES6 Goodies

[Read about the cool stuff ES6 can do you for you](docs/es6.md)


## Dictionary

- Controllers
	- are objects.
	- The object's keys are **Routes**.
	- These routes are string that have **Tokens** `"/:token1/:token2"`.
	- The functions in controllers are called **Actions**, which handle what happens for the specified route.
	- The tokens are matched and passed as **Params** in the actions
		- `"/:token1/:token2"(req, res, next, param1, param2) {}`
		- `"/:id/:username?"(req, res, next, id, username) {}`

- Views
	- Are any HTML or hbs file. They can be included, compiled or parsed. You can put them in folders to organize.  Views are rendered with a layout which is just another view defined in res.layout.
