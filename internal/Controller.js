/* http://traceur-compiler.googlecode.com/git/demo/repl.html
class Controller {
	constructor(name) {
		this.name = name;
		console.log(this.name, "constructed.");
	}

	view() {
		return JSON.stringify({
			asdf: "asdf"
		});
	}

	get name() {
		return "controller";
	}
}

class User extends Controller {
	get(req, res) {
		res.render("user/get");
	}
}
*/
