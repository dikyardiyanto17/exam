const { RedisDB } = require("../config/redis")
const { Helpers } = require("../helpers")
const Questions = require("../schema/Questions")
const zlib = require("zlib")

class Question {
	static async index(req, res, next) {
		try {
			const redis = RedisDB.getClient()
			const cacheKey = "questions:all"

			// Try Redis
			let cached
			try {
				const buffer = await redis.getBuffer(cacheKey) // get as Buffer
				if (buffer) {
					cached = JSON.parse(zlib.gunzipSync(buffer).toString())
					return res.status(200).json({
						...Helpers.RESPONSESUCCESS.CODE_200,
						message: "Retrieved from Redis cache",
						data: cached,
					})
				}
			} catch (err) {
				console.error("Redis error:", err.message)
			}

			// Cache miss — query MongoDB
			const questions = await Questions.find()

			// Save compressed to Redis
			try {
				const compressed = zlib.gzipSync(JSON.stringify(questions))
				await redis.set(cacheKey, compressed, { EX: 7200 }) // 2 hours expiry
			} catch (err) {
				console.error("Redis set error:", err.message)
			}

			return res.status(200).json({
				...Helpers.RESPONSESUCCESS.CODE_200,
				message: "Retrieved from DB",
				data: questions,
			})
		} catch (error) {
			next(error)
		}
	}
	static async post(req, res, next) {
		try {
			await Questions.create({ questionId: "questionid", question: "Hallo Apa kabar ?", answer: "A", type: "choice" })
			await res
				.status(Helpers.RESPONSESUCCESS.CODE_201.statusCode)
				.json({ ...Helpers.RESPONSESUCCESS.CODE_201, message: "Successfully create exam", data: [] })
		} catch (error) {
			next(error)
		}
	}

	static async view(req, res, next) {
		try {
			await res.render("/pages/question/index.js")
		} catch (error) {
			next(error)
		}
	}
}

module.exports = { Question }
