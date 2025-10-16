const mongoose = require("mongoose")
const { Schema } = mongoose

const questionSchema = new Schema(
	{
		questionId: String,
		type: {
			type: String,
			required: true,
			enum: ["essay", "choice"],
		},
		question: {
			type: String,
			required: true,
		},
		choice: [],
		answer: {
			type: String,
			required: true,
		},
		attachment: [],
		createdBy: String,
	},
	{ timestamps: true }
)

module.exports = mongoose.model("Question", questionSchema)
