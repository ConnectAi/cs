# CornerStone Docs

Web framework built on Node.js.

This node framework is a production-ready Node.js framework that takes advantage of ECMAScript 6 through the use of [Google Traceur](https://github.com/google/traceur-compiler).  It is built on top of [express](http://expressjs.com) at its core, and also uses [when.js](https://github.com/cujojs/when) for many of the internal APIs.
____
View the docs on [Models](https://github.com/ConnectAi/cornerstone/blob/dev/master/docs/models.md), [Controllers](https://github.com/ConnectAi/cornerstone/blob/dev/master/docs/controllers.md) and [Views](https://github.com/ConnectAi/cornerstone/blob/dev/master/docs/views.md)  
____

# Prereqs and Opinions

- [Node.js](http://nodejs.org) and [NPM](https://npmjs.org)
- MySQL (you (currently) need MySQL to benefit from models, though you may use Cornerstone without)
- Redis (for sessions) Memory also supported and is on by default. But if you want persistent sessions, turn on redis.


# Installation
____

The idea here is that you have your app in development on Git. Then you'll clone or deploy to your production server, and run CS in production mode.

### Development
	> npm install -g cs
	> cs init {{appname}}

### Production (with Nginx & Git)

    > npm install -g cs
    > git clone {{yourapp}} /your/app/dir
    > cd /your/app/dir
    > npm install
    
Add your Nginx Rule (Assumes your production port is 3000)
	
	server {
	    listen 80;
	    server_name {{yourDomain.com}}
	    access_log  /var/log/nginx/node.log;
		location / {
			proxy_pass	http://127.0.0.1:3000/;
		}
	}
	
Create a service in /etc/init/node.conf
	
	description "node server"

	start on started mountall
	stop on shutdown
	
	respawn
	respawn limit 99 5
	
	script
	    export HOME="{{APP DIR}}}"
	    cd $HOME
	    exec /usr/bin/node {{APP DIR}}}/index.js production >> /var/log/node.log 2>&1
	end script
	
	post-start script
	end script
    
    
Restart Nginx
	
	/etc/init.d/nginx restart

### Production (_without_ Nginx & Git)

 	# get your files onto the live server and SSH in
    > npm install -g cs
    > cd {{app dir}}  
 	> npm install

_You should probably still install the init script above_


# How to run
___

### Development
	> cd {{app dir}}
	> cs run
### Live
	> start {{whatever you called the file in /etc/init/}}

	
note: If you're in your CS dir already, you can just run `cs run`  
note: If you're running CS behind nginx, you don't need the word `production`

____

# Config
___

`config.json`

- you can make any arbitrary configs you want
- if you want comments or logic in the config file, you need to change it from .json to .js and then module.exports the object. `module.exports = { ... }`
- Anything outside of the `env` key is the default. Everything inside the `env` key will overwrite those depending on the enviroment you run in.  You run different arbitrary enviroments via `cs run [myapp] [env]`

.

   
    {
    	"name" 		: "appname",
    	"port" 		: "8000"
		"session" 	: "redis | memory",
		"debug" 	: false | true,
		"db" : {
			"adapter"  : "mysql",
			"mysql"	   : {
				"host" : "localhost",
				"user" : "root",
				"password" : "",
				"database" : "db"
			}
		},
		"env" : {
			"production" : {
				"port" : 80,
				"db" : { ... }
				}
			},
			"development" : {
				"debug": true
			}
		}
    }



# Directory Structure
___


	./controllers
	./models
	./public
	./private
	./views
	./services

- `./public` is your web root.  All static files, js, css, images, etc. go here.
- `./private` is where you put things to be compiled such as stylus, coffeescript, or ES6 files.  By default, stylus files will compile and minify files into public/css automatically.
- `./services` is the location of all services which are basically CS extended functionality



# Debugging
___


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


# Utilities
___


### Include
	// include and compile a template
	var compiledHTML = app.util.include(path/to/file)(data);

# Services
___

Services are a way to share complete parts of CS that are just arbitrary functions.
### Create a service
- Create `services/yourservice/index.js`
- Create a `package.json` defining your attributes and dependecies
- make sure your file `module.exports = ...`
- You can export anything. A function, class an object.

Sample service package.json for gmail service

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
	
_Currently the services package.json don't do anything_

# ES6 Goodies
___

[Read about the cool stuff ES6 can do you for you](https://github.com/ConnectAi/cornerstone/blob/dev/master/docs/es6.md)	


# Dictionary
___


- Models
    - are ES6 Classes, inheriting from a base model.
    - Their functions are called **Methods**

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
