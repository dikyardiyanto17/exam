const { APIRouter } = require("./api")
const { Router } = require("./router")

class MainRouter extends Router {
	static APIRouter = APIRouter
	static async initRouter() {
		this.router.use("/api", this.APIRouter.getRouter())
		this.router.get("/", (req, res, next) => {
			res.send("🏠 Welcome to Home Page")
		})
	}
}

// Initialize routes at startup
MainRouter.initRouter()

module.exports = { MainRouter }
