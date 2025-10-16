class Configuration {
	static appName = "Exam Application"
	static baseUrl = "https://localhost:9102"
	static url = "/exam"
	static port = 9110
	static limiter = {
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 100, // limit each IP to 100 requests per window
		message: "Too many requests, please try again later.",
		standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
		legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	}
	static allowedCors = {
		origin: ["http:localhost:9110/exam", "https://modoto.net/exam"],
		credentials: true,
	}
}

module.exports = { Configuration }
