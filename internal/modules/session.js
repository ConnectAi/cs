module.exports = {
	"memory": (session) => session,

	"redis": (session) => {
		let express = require("express");
		let RedisStore = require("connect-redis")(express);
		session.store = new RedisStore();
		return session;
	}
};
