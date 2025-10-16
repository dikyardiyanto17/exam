const express = require("express")
const { Router } = require("../../router")

class QuestionRouter extends Router {
	static async initRouter() {
		this.router.get("/", this.Controller.Question.index)
		this.router.post("/", this.Controller.Question.post)
	}
}

// Initialize routes at startup
QuestionRouter.initRouter()

module.exports = { QuestionRouter }
