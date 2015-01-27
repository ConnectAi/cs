## Views

```
/views/user.html
```


### Layouts

- By default all views use `/views/layout.html`.
- Actions can change layout by serving `res.view({ layout: "mylayout" })`.
- You can specify no layout by setting `res.view({ layout: false })`.
- You can change this for an entire controller by setting `res.locals.layout` inside a `*` action of a controller.
- Make sure to have the `window.CS` part included in your layout if you want to use our debugging.
- The same variables are available here as the view.


### Hook

defines a placeholder (foo) in your layout file to be extended using the {{bind}} helper in another view.

```
{{{hook "foo"}}}
```


### Bind

The content of a placeholder defined by {{{hook}}} in a layout

```html
{{#bind "styles"}}
	<link rel="stylesheet" href="specific.css">
{{/bind}}
```


### Template Variables

Any variable that you pass to the first paramater of res.json()
Also any private variables CS makes available. With debugging on check CS.private for more.
See [The official Handlebars docs](http://handlebarsjs.com/) for more

```
{{variable}}
```

If you need to preserve HTML tags

```
{{{variable}}}
```

If you need to loop over an array or object

```
{{#each variable}}
	{{thing}}
{{/each}}
```

You also have access to the session via

```
{{session}}
```


If one or more of the values passed to the view are promises, Cornerstone will send the data to the browser when the promise resolves.
You can tell it to output this data in the view when it arrives by using the `{{stream}}` helper:

```handlebars
{{{stream "promiseKey"}}}
```

### Variables in EVERY view

Using CS built in middleware we can add a variable that every single view gets
in your controllers/index.js add a `"*"()` method if you don't have one already.

```js
"*"(req, res, next) {
    // get the current year
    var d = new Date();
    var year = d.getFullYear();

    // every view now has {{year}}
    res.locals.year = year;
}
```

Side note. You can do this in a specific controller to make variables available only for that controller instead of app-wide. Also, if one of your res.view()s overwrite the variable, it will in fact be overwritten.


### Include

Inlude another file. This will take private varaibles and be parsed just like everything else.

```
{{{include "header"}}}
```

Using parse=false will cause the template NOT to be parsed. Meaning you can use this template for client side handlebars.

```
{{{include "header" parse=false}}}
```


### Debugging

Log a template variable out to the node.js console

```
{{log variable}}
```

Log a template variable out to the browser console

```
{{log variable client=true}}
```

When running in development mode `cs run` or `cs run dev` you can use the browser console to view all template variables.
** Note: This only works if you keep `window.CS = {{{json exposed}}};` in your layout.

```js
CS.private
```
