# CornerStone Docs

Web framework built on node.js.

This node framework will be a production-ready node.js framework that takes full (as much as we can) advantage of EcmaScript 6 by making use of Google Traceur. It is built on top of express at its core, and also uses when.js for many of the internal APIs.

## Prereq
- NodeJS
- mySQL (for mysql package)
- GIT

## Installation
- download the skeleton app https://github.com/ConnectAi/cornerstone-skeleton/archive/master.zip
- CD into dir
- run npm install
	
## How to run
- CD into project root
- `$ node index`
- http://localhost:3000 

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
- Methods can be freely called from app.db  
- Methods can be called on a model where the model's defaults are set
- All methods return a deferred;
- All querires are logged to /app.log

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
	// returns array of arrays

#### raw query
	app.db.query(sql)
	// returns array of arrays
	// identical to queryMulti


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
        "/bringATowel"(req, res, next) {}
        
        // single method with a token
        "save/:id"(req, res, next) {}
        
        // single method with 2 tokens, where page isn't required
        "goto/:id/:page?"(req, res, next) {}
    };
    

### req
    
    // the session
    req.session
    
    // post body
    req.body
    
    // GET params
    req.query
    
    // token'd params
    req.params

### res
    
    // output a view
    res.view([view], private, public);
        
        //view           is optional, a path to a view you wanna use instead  
        //private        object of data to become available in your view  as {{var}}
        //public         object of data to become available in your javascript. (CS.public)
        
    // output json
    res.json({})
    
    // output text
    res.send("")
    


### next
    
    // will move onto to the next matching route
    next()
    
### req.param
outside a controller, you can define a param

	req.param("user", (req,res,next) => {})
this allows you to alert / valdiate a param app wide
just use your own res.something or let it go with next()
this is run when you request a route with a token like `/:user`

    
## Views
`/views/user.html`

### Layouts
- by default all views use /views/layout.html
- actions can change layout by serving res.view({layout:"mylayout"})
- you can server no layout by setting res.view({layout:false})
- you can change this for an entire controller by alerting res.locals inside a * action of a controller
- make sure to have window.CS part included in your layout if you want debugging
- `{{{block "name"}}}` will make a new block for your layouts to `{{#extend "name"}}`
- the same variables are avaialble here as the view


###extend a block from your layout
    {{#extend "styles"}}
        <link rel="stylesheet" href="specific.css">
    {{/extend}}
    
###use variables from the server        
    {{variable}}
    

###variables that need to be HTML
    {{{variable}}}
    
###include another HTML file (maybe a template)
    {{{include "header"}}}
    
###loop
    {{#each variable}}
        {{thing}}
    {{/each}}
    

# Directory Structure

/controllers  
/models    
/public  
/private  
/views  

- *public* is your web root.  All static files, js, css, images, etc. go here.  
- *private* is where you put things to be compiled, i.e. stylus and coffeescript  
by default, stylus files will auto compile and minify into public/css

    
# Debugging
- to run in debug mode, at the command line run `node index` or `node index development`
- /app.log is a log of all queries
- **??? Is there a way to log stuff manually? ???**
- log is an alias to console.log
- in the browser, type CS to see the main object
	- CS.private = all variables available to your view that you passed
	- CS.public = variables available to your JS files in CS.public
	- CS.session = the session (which is available in your view)
	- CS.server = server vars (which are available in your view)



# ES6 Goodies
Hey we have ES6, `let`'s use it
    
    // expand and object into variables
    var {a, b, c} = myObjectWith3Keys;
    
    
    // expand and array into variables
    var [a, b, c] = myArrayWith3Indecies;
    
    
    // use let as a temp variable
    for(let i = 0; i <= thing; i++)
    
    
    // loop through properties of mine not my prototypes
    for(key of object)
    
    
    // keeping the 'this' scope (and not having to write 'function'
    var myFunc () => {
        // my 'this' has not changed scope
    }
    
    // quasi literals.  You can have variables and JS inside a string!
    var coolString = `Happy ${3 + .14} ${day}`;
    
    
    // Default arguments
    var speak(greeting = "hello", recipient = "world") {
        return `${greeting} ${recipient}!`;
    };
    
    
    // no need to repeat keys and valus in object if identical
    var one = {}, two = {}, three = {};
    function foo() {
        return {
            one: one, 	// not needed
         	two,       	// good to go
            three
        }
    }

# Run in Production
We're gonna run our app behind Nginx on port 8000. This assumes your app is living in /var/www. The following steps ensure that 1 instance of your node app will continue running. Even if there are errors or failures. It will log out to /var/log/node.  For a more scalable launch, place behind load balancers.

### Configure config.js
	// change config production port to 8000 from 80

###install init script
	vi /etc/init/node-app.conf
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
	
	upstream <<WEBSITE>> {
    	server 127.0.0.1:8000;
	}
	
	server {
		server_name <<WWW.WEBSITE.COM>> WEBSITE.COM;
		listen 80;
		access_log  /var/log/nginx/app.wb.log;
		
		location / {
	      proxy_set_header X-Real-IP $remote_addr;
	      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	      proxy_set_header Host $http_host;
	      proxy_set_header X-NginX-Proxy true;
	
	      proxy_pass http://<<WEBSITE>>/;
	      proxy_redirect off;
	      
	      proxy_http_version 1.1;
		  proxy_set_header Upgrade $http_upgrade;
		  proxy_set_header Connection "upgrade";
	      
	    }
	}
	
	
###how to run
	$ start node-app

# Dictionary

- Models
    - are ES6 Classes
    - the functions are called **Methods**
    
- Controllers
    - A controller is an object
    - The object's keys are **Routes**
    - the Objects functions are called **Actions**
    - The Action Route is a string that has tokens "/:token1/:token2"
    - The tokens are matched and passed as **Params** in the Action 
        - "/:token1/:token2(req,res,next, param1, param2)"
    
- Views
