const { Router } = require("../router")
const { QuestionRouter } = require("./question")

class APIRouter extends Router {
	static async initRouter() {
		this.router.use("/questions", QuestionRouter.getRouter())
	}
}

// Initialize routes at startup
APIRouter.initRouter()

module.exports = { APIRouter }
