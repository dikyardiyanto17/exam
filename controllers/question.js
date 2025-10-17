const { RedisDB } = require("../config/redis")
const { Helpers } = require("../helpers")
const Questions = require("../schema/Questions")
const zlib = require("zlib")

class Question {
	static async index(req, res, next) {
		try {
			const redis = RedisDB.getClient()
			const cacheKey = "questions:all"

			const cached = await redis.get(cacheKey)
			if (cached) {
				console.log("📦 Cache hit — returning from Redis")
				return res.status(Helpers.RESPONSESUCCESS.CODE_200.statusCode).json({
					...Helpers.RESPONSESUCCESS.CODE_200,
					message: "Successfully Retrieved Data (from cache)",
					data: JSON.parse(cached),
				})
			}

			const questions = await Questions.find({}, { _id: 1, title: 1, description: 1 })

			// Save to Redis with expiry 2 hour
			await redis.set(cacheKey, JSON.stringify(questions), { EX: 7200 })

			return res.status(Helpers.RESPONSESUCCESS.CODE_200.statusCode).json({
				...Helpers.RESPONSESUCCESS.CODE_200,
				message: "Successfully Retrieved Data (from DB)",
				data: questions,
			})
		} catch (error) {
			next(error)
		}
	}

	static async index_zip(req, res, next) {
		try {
			const redis = RedisDB.getClient()
			const cacheKey = "question_zip:all"

			let cached
			try {
				cached = await redis.get(cacheKey)
				if (cached) {
					const data = JSON.parse(cached)
					console.log("📦 Cache hit — returning from Redis")
					return res.status(Helpers.RESPONSESUCCESS.CODE_200.statusCode).json({
						...Helpers.RESPONSESUCCESS.CODE_200,
						message: "Successfully Retrieved Data (from cache)",
						data,
					})
				}
			} catch (err) {
				console.warn("⚠️ Redis read error or invalid cache:", err.message)
				await redis.del(cacheKey).catch(() => {})
			}

			// Cache miss — query MongoDB
			const questions = await Questions.find({}, { _id: 1, title: 1, description: 1 })

			// Save to Redis with expiry 2 hours
			try {
				await redis.set(cacheKey, JSON.stringify(questions), { EX: 7200 })
			} catch (err) {
				console.error("Redis set error:", err.message)
			}

			return res.status(Helpers.RESPONSESUCCESS.CODE_200.statusCode).json({
				...Helpers.RESPONSESUCCESS.CODE_200,
				message: "Successfully Retrieved Data (from DB)",
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
