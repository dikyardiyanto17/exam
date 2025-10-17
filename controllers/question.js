const { RedisDB } = require("../config/redis")
const { Helpers } = require("../helpers")
const Questions = require("../schema/Questions")

const memoryCache = new Map()

class Question {
	static async index(req, res, next) {
		try {
			const redis = RedisDB.getClient()
			const cacheKey = "questions:all"

			// Check local memory first
			if (memoryCache.has(cacheKey)) {
				return res.status(200).json({
					...Helpers.RESPONSESUCCESS.CODE_200,
					message: "Retrieved from memory cache",
					data: memoryCache.get(cacheKey),
				})
			}

			// Try Redis
			let cached
			try {
				cached = await redis.get(cacheKey)
			} catch (err) {
				console.error("Redis error:", err.message)
			}

			if (cached) {
				const data = JSON.parse(cached)
				memoryCache.set(cacheKey, data) // populate local memory cache
				return res.status(200).json({
					...Helpers.RESPONSESUCCESS.CODE_200,
					message: "Retrieved from Redis cache",
					data,
				})
			}

			// Cache miss — query MongoDB
			const questions = await Questions.find()

			// Save to Redis with expiry
			try {
				await redis.set(cacheKey, JSON.stringify(questions), { EX: 7200 })
			} catch (err) {
				console.error("Redis set error:", err.message)
			}

			memoryCache.set(cacheKey, questions) // update memory cache
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
