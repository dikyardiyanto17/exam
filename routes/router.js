// routes/router.js
const express = require("express");
const { Controller } = require("../controllers")
const { Middlewares } = require("../middlewares");

class Router extends Middlewares {
	static router = express.Router(); 
	static Controller = Controller

	static initRouter() {
	}

	static getRouter() {
		return this.router;
	}
}

module.exports = { Router };
