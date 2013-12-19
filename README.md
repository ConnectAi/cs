# Cornerstone Docs

Web framework built on Node.js.

This node framework is a production-ready Node.js framework that takes advantage of ECMAScript 6 through the use of [Google Traceur](https://github.com/google/traceur-compiler).  It is built on top of [express](http://expressjs.com) at its core, and also uses [when.js](https://github.com/cujojs/when) for many of the internal APIs.

## Prereq
- [Node.js](http://nodejs.org) and [NPM](https://npmjs.org)
- MySQL (you (currently) need MySQL to benefit from models, though you may use Cornerstone without)

## Installation
	> wget https://github.com/ConnectAi/cornerstone-skeleton/archive/master.zip
	> unzip master.zip
	> mv cornerstone-skeleton-master your-app
	> cd your-app
	> npm install

## How to run
	> cd /path/to/your-app
	> node index
	> open http://localhost:3000

## Config
`config.js`

	// see config.js for detailed comments
	// you cannot make arbitrary configs


## Models
`/models/file.js`

    class File extends app.Model {

        upload(files) {
            // ...upload a file
            return ...
        }

    );
    module.exports = File;


### app.db (mysql package)
- Methods can be freely called from `app.db`.
- Methods can be called on a model where the model's defaults are set.
- All methods return a `when.js` deferred.
- All queries are logged to `./app.log`

#### save / update
	app.db.save( data, [table], [primaryKey]);
		// data is either an array of objects (bulk insert)
		// or single object
			// if single object has primaryKey is set (Update)
			// if the primaryKey isn't set (Update)
		// pass a table if you don't want to use the default table for that model
		// pass a primaryKey if wanting Update and pkey is not "id"
		// returns ID of updated row or Inserted row


#### delete
	app.db.delete(where, [table])
		// delete passing a where string
		// change table optional
		// returns deleted ID

#### get by id
	app.db.findById(id, [table])
	// returns array

#### get by any where
	app.db.find(where, [table])
	// returns array

#### get all by any where
	app.db.findAll(where, [table])
	// returns array of arrays

#### raw query get one value
	app.db.queryValue(sql)
	// returns single value

#### raw query get single row
	app.db.querySingle(sql)
	// returns array

#### raw query get many row
	app.db.queryMulti(sql)
	// returns array of arrays (identical to app.db.query)

#### raw query
	app.db.query(sql)
	// returns the full query result


## Controllers
`/controllers/user.js`

    module.exports = {

        // catch all to do anything action
        "*"(req, res, next) {},

        // single method
        walk(req, res, next) {},

        // actions with different verbs
        talk: {
            get (req,res, next) {},
            post (req,res,next) {}
        },

        // array of actions
        act: [
            (req, res, next) {},
            (req, res, next) {}
        ],

        // a route that matches outside this controller
        "/bringATowel"(req, res, next) {},

        // single method with a token
        "save/:id"(req, res, next) {},

        // single method with 2 tokens, where page isn't required
        "goto/:id/:page?"(req, res, next) {}
    };


### req

    // Session data
    req.session

    // POST body
    req.body

    // Parsed GET querystring params
    req.query

    // Tokenized params from the URL.
    req.params

### res

    // output a view
    res.view([view], private, public);

        // view           is optional, a path to a view you wanna use instead
        // private        object of data to become available in your view  as {{var}}
        // public         object of data to become available in your javascript. (CS.public)

    // output json
    res.json({});

    // output text
    res.send("");


### next

    // will move onto to the next matching route
    next()

### req.param
Outside a controller, you can define a param to use when defining routes.

	req.param("user", (req, res, next) => {})
This allows you to handle a param type app-wide.
Just use your own res.something or let it run `next()`.
This is run when you request a route with a token like `/:user`.


## Views
`/views/user.html`

### Layouts
- By default all views use `/views/layout.html`.
- Actions can change layout by serving `res.view({ layout: "mylayout" })`.
- You can specify no layout by setting `res.view({ layout: false })`.
- You can change this for an entire controller by setting `res.locals.layout` inside a `*` action of a controller.
- Make sure to have the `window.CS` part included in your layout if you want to use our debugging.
- `{{{block "name"}}}` will make a new block for your layouts to `{{#extend "name"}}`.
- The same variables are available here as the view.


### extend a block from your layout
    {{#extend "styles"}}
        <link rel="stylesheet" href="specific.css">
    {{/extend}}

### use variables from the server
    {{variable}}


### variables that need to be HTML
    {{{variable}}}

### include another HTML file (maybe a template)
    {{{include "header"}}}

### loop
    {{#each variable}}
        {{thing}}
    {{/each}}


# Directory Structure

	./controllers
	./models
	./public
	./private
	./views

- `./public` is your web root.  All static files, js, css, images, etc. go here.
- `./private` is where you put things to be compiled such as stylus, coffeescript, or ES6 files.  By default, stylus files will compile and minify files into public/css automatically.


# Debugging
- To run in debug mode, run `> node index` or `> node index development` (`development` is the default environment).
- `./app.log` is a log of all database queries.
- **??? Is there a way to log stuff manually? ???**
- `log` is a convenient alias to `console.log`.
- In the browser, `CS` is the main object.
	- `CS.private` -- all variables available to your view that you passed
	- `CS.public` -- variables available to your JS files in CS.public
	- `CS.session` -- the session (which is available in your view)
	- `CS.server` -- server vars (which are available in your view)



# ES6 Goodies
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

# Run in Production
Let's run our app behind Nginx on port `8000`. This assumes your app is living in /var/www/your-app. The following steps ensure that one instance of your node app will continue running... even if there are errors or failures. It will log out to /var/log/node.  For a more scalable launch, place behind load balancers.

### Configure config.js
	// change config production port to 8000 from 80

###install init script
	> vi /etc/init/node-app.conf
---

	description "node.js server"

	start on started mountall
	stop on shutdown
	
	respawn
	respawn limit 99 5
	
	script
	    export HOME="/var/www"
	    cd $HOME
	    exec /usr/bin/node /var/www/index.js production >> /var/log/node.log 2>&1
	end script
	
	post-start script
	end script


###nginx setup

	upstream <<APP_NAME>> {
    	server 127.0.0.1:8001;
	}
	
	server {
	    server_name <<DOMAIN>>;
	    listen 80;
	    access_log  /var/log/nginx/app.node.log;
	
	    location / {
	      proxy_pass http://<<APP_NAME>>;
	      proxy_redirect off;
	      proxy_set_header X-Real-IP $remote_addr;
	      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	      proxy_set_header Host $http_host;
	      proxy_set_header X-NginX-Proxy true;
	      proxy_http_version 1.1;
	      proxy_set_header Upgrade $http_upgrade;
	      proxy_set_header Connection "upgrade";
	
	    }
	}


###how to run
	> start node-app

# Dictionary

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
