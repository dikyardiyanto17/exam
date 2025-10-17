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
				return res.status(Helpers.RESPONSESUCCESS.CODE_200.statusCode).json({
					...Helpers.RESPONSESUCCESS.CODE_200,
					message: "Successfully Retrieved Data (from cache)",
					data: JSON.parse(cached),
				})
			}

			const questions = await Questions.find().lean()

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

	static async index_pooling(req, res, next) {
		try {
			const redis = RedisDB.getClient()
			const cacheAllKey = "question_pooling:all"

			// Try read from cache first
			let cached
			try {
				cached = await redis.get(cacheAllKey)
				if (cached) {
					return res.status(Helpers.RESPONSESUCCESS.CODE_200.statusCode).json({
						...Helpers.RESPONSESUCCESS.CODE_200,
						message: "Successfully Retrieved Data (from cache)",
						data: JSON.parse(cached),
					})
				}
			} catch (err) {
				console.warn("⚠️ Redis read error:", err.message)
				await redis.del(cacheAllKey).catch(() => {})
			}

			const questions = await Questions.find().lean()

			const pipeline = redis.multi()
			for (const q of questions) {
				const key = `question:${q._id}`
				pipeline.set(key, JSON.stringify(q))
				pipeline.expire(key, 7200)
			}
			
			pipeline.set(cacheAllKey, JSON.stringify(questions), { EX: 7200 })
			await pipeline.exec()

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
