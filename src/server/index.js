const path = require("path")
require("dotenv").config({
	path: path.resolve(__dirname, `../../.env`),
})

const express = require("express")
const { createProxyMiddleware } = require("http-proxy-middleware")

const PORT = process.env.PORT || 80
const REACT_APP_API_URL = process.env.REACT_APP_API_URL || "http://localhost:3051"

const app = express()

// Handle proxy to REACT_APP_API_URL
const apiProxy = createProxyMiddleware({
	target: REACT_APP_API_URL,
})
app.use("/api", apiProxy)

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, "../../build")))

// All other GET requests not handled before will return our React app
app.get("*", (req, res) => {
	res.sendFile(path.resolve(__dirname, "../../build", "index.html"))
})

app.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`)
})
