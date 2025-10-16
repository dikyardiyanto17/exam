const { Configuration } = require("../config")
const { Helpers } = require("../helpers")
class Middlewares {
	static async configuration(req, res, next) {
		try {
			res.locals.appName = Configuration.appName
			res.locals.baseUrl = Configuration.baseUrl
			next()
		} catch (error) {
			next(error)
		}
	}

	static async errorHandler(err, req, res, next) {
		const timestamp = new Date().toLocaleString("en-ID", {
			timeZone: "Asia/Jakarta",
			hour12: false,
		})
		console.log("- ErrorTime : ", timestamp)
		console.log("- ErrorName : ", err.name)
		console.log("- ErrorMessage : ", err.message)
		console.log("- Error : ", err)

		let statusCode = 500
		let name = "Internal Server Error"
		let message = err.message

		switch (true) {
			case err.name === Helpers.RESPONSEERROR.BADREQUEST.name:
			case err.name === Helpers.RESPONSEERROR.VALIDATIONERROR.name:
				statusCode = 400
				name = err.name
				break

			case err.name === Helpers.RESPONSEERROR.INVALIDUSER.name:
				statusCode = 401
				name = err.name
				break

			case err.name === Helpers.RESPONSEERROR.FORBIDDEN.name:
			case err.name === Helpers.RESPONSEERROR.GUESTUSERERROR.name:
				statusCode = 403
				name = err.name
				break

			case err.name === Helpers.RESPONSEERROR.DUPLICATED.name:
			case err.name === Helpers.RESPONSEERROR.NOTFOUND.name:
				statusCode = 404
				name = err.name
				break

			case err.name === Helpers.RESPONSEERROR.JSONWEBTOKEN:
				statusCode = 401
				name = err.name
				break

			case err.name === Helpers.RESPONSEERROR.CASTERROR.name:
			case err.name === Helpers.RESPONSEERROR.NOTFOUNDPAGE.name:
				statusCode = 401
				name = err.name
				break
		}

		if (err.name === Helpers.RESPONSEERROR.NOTFOUNDPAGE.name) {
			return res.render("pages/not_found/index", {
				errorMessageHandler: "",
			})
		}

		res.status(statusCode).json({ status: false, name, message })
	}
}

module.exports = { Middlewares }
