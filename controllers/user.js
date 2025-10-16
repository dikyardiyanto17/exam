class User {
	static async view(req, res, next) {
		try {
			await res.render("/pages/user/index.js")
		} catch (error) {
			next(error)
		}
	}
}

module.exports = { User }
