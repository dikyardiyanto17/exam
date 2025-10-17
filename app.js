require("dotenv").config()
const mongoose = require("mongoose")
const express = require("express")
const cors = require("cors")
const app = express()
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const http = require("http")
const path = require("path")
const rateLimit = require("express-rate-limit")

const { MongoDB } = require("./config/mongodb.js")
const { Configuration } = require("./config/index.js")
const { Middlewares } = require("./middlewares/index.js")
const { Helpers } = require("./helpers/index.js")
const { MainRouter } = require("./routes/index.js")
const { RedisDB } = require("./config/redis.js")

MongoDB.connect()

const rateLimiterSetting = rateLimit({
	...Configuration.limiter,
	handler: (req, res, next, options) => {
		next({
			name: Helpers.RESPONSEERROR.MANYREQUEST.name,
			message: Helpers.RESPONSEERROR.MANYREQUEST.message,
			status: Helpers.RESPONSEERROR.MANYREQUEST.status,
		})
	},
})

// app.use(rateLimiterSetting)
app.use(cookieParser())
app.use(cors({ ...Configuration.allowedCors }))
app.set("view engine", "ejs")
app.use(
	bodyParser.urlencoded({
		limit: "50mb",
		extended: true,
		parameterLimit: 1000000,
	})
)
app.use(
	bodyParser.json({
		limit: "50mb",
	})
)
app.use(express.static(path.join(__dirname, "views")))

app.use(express.static("public"))
app.use(Configuration.url, express.static(path.join(__dirname, "public")))

app.use(Middlewares.configuration)

const httpServer = http.createServer(app)
mongoose.connection.once("open", async () => {
	await RedisDB.startRedis()
	await httpServer.listen(process.env.PORT, () => {
		console.log("App On : " + process.env.PORT)
	})
})
app.use(Configuration.url, MainRouter.getRouter())
app.use(Middlewares.errorHandler)
