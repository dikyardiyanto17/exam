const mongoose = require("mongoose")

class MongoDB {
	static uri = process.env.MONGODB_MY_DATABASE

	static async connect() {
		try {
			await mongoose.connect(this.uri, {
				serverSelectionTimeoutMS: 5000,
				autoIndex: true,
			})
			console.log("✅ MongoDB connected")
		} catch (err) {
			console.error("❌ MongoDB connection error:", err.message)
		}
	}
}

mongoose.connection.on("disconnected", () => {
	console.warn("⚠️ MongoDB disconnected")
})

mongoose.connection.on("reconnected", () => {
	console.log("🔄 MongoDB reconnected")
})

mongoose.connection.on("error", (err) => {
	console.error("❌ MongoDB error:", err.message)
})

module.exports = { MongoDB }
