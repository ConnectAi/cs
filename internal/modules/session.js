module.exports = {
	memory: function(session) {
		let connect = require("connect");
		let MemoryStore = connect.session.MemoryStore;
		session.store = new MemoryStore();
		return session;
	},

	redis: function(session) {
		let express = require("express-session");
		let RedisStore = require("connect-redis")(express);
		session.store = new RedisStore();
		return session;
	}
};
