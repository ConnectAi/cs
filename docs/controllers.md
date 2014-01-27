## Controllers
`/controllers/person.js`

    module.exports = {

        // catch all to do anything action
        "*" (req, res, next) {},

        // single method
        walk (req, res, next) {},

        // actions with different verbs
        talk: {
            get (req,res, next) {},
            post (req,res,next) {},
            sock (req,res)
        },

        // array of actions
        act: [
            (req, res, next) {},
            (req, res, next) {}
        ],

        // single method with a token
        "save/:id"(req, res, next, id) {},

        // single method with 2 tokens, where page isn't required
        "goto/:id/:page?"(req, res, next, id, page) {}
        
        // a route that matches outside this controller
        "/bringATowel"(req, res, next) {},
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
This allows you to handle a param type app-wide.
Modify or use req or res and then call `next()`  
This is run when you request a route with a token like `/:user`

	req.param("user", function(req, res, next) { ... })