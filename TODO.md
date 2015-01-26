- `res.view.model` should be the main data the view needs
- `res.view.{{anything}}` should be any extra data the view needs
- in debug mode, `res.private` should contain all keys on res.view
- `res.view.public` should be any data you want to be available to `CS.public`
- `res.view([view], {key:value, model:{key:value}}, {public});`
	- the first param in view is the path as always, which can be omitted
	- the 2nd param in the view is an extension of res.view properties, where one of them can be model which would extend the model
	- `res.view({ model: { sean:"clark" }});` would send the model to the page, available as {{model.sean}}
		- it would extend any other `res.view.model` that existed in that res/req chain
- make sockets more integrated
- make generators more integrated
- expose CS middleware
	- make stylus a plugin
- parse external js files {private,public}.js
	- enable/disable in config


## OLD

express:
	- make routes case-sensitive
	- server.use doesn't really work, because of when we run it
		- I couldn't find an easy solution for this, as even running them right before routes is in app.loader.then, which makes it after the error-handling middleware...
fixes:
	- make {{extend}} work with req.redirect()
enhancements:
	- prod:
		- concat/minify scripts and styles
		- compress images
		- cache busters
			- likely option-based:
				- git sha1s
				- timestamps
				- none
features:
	- allow for middleware
	- websockets
		- API access
		- streamed log
	- easy dynamic layout (or lack thereof) based on !!req.xhr
- future
	- put thought into how using types could help us (or make us more safe at night...)
- docs
	- rewrite
	- redirect
