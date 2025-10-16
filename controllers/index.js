const { Question } = require("./question")
const { User } = require("./user")

class Controller {
	static Question = Question
	static User = User
}

module.exports = { Controller }
