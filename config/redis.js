const { createClient } = require("redis")

class RedisDB {
	static host = {
		ip: process.env.REDIS_IP || "127.0.0.1",
		port: process.env.REDIS_PORT || 6379,
		password: process.env.REDIS_PASSWORD || undefined,
	}

	static client = null

	static async startRedis() {
		try {
			if (!this.client) {
				this.client = createClient({
					socket: {
						host: this.host.ip,
						port: this.host.port,
						reconnectStrategy: retries => Math.min(retries * 50, 2000),
					},
					password: this.host.password,
				})

				this.client.on("error", (err) => console.error("❌ Redis Error:", err))
			}

			await this.client.connect()
			console.log("✅ Connected to Redis")
		} catch (error) {
			console.error("❌ Redis Connection Failed:", error.message)
		}
	}

	static getClient() {
		if (!this.client) {
			throw new Error("Redis client not initialized. Call RedisDB.startRedis() first.")
		}
		return this.client
	}

	static async quit() {
		if (this.client && this.client.isOpen) {
			await this.client.quit()
			console.log("🧹 Redis connection closed")
		}
	}
}

module.exports = { RedisDB }
