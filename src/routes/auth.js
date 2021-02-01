const express = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const config = JSON.parse(
	fs.readFileSync(
		path.join(__dirname, "..", "..", "confs", "config.json"),
		"utf-8"
	)
);
const router = express.Router();
function restrict(req, res, next) {
	// Gather the jwt access token from the cookie
	const authCookie = req.cookies["token"];
	const token = authCookie && authCookie.split(" ")[1];
	// If there isn't any token
	if (token == null) return res.sendStatus(401);

	jwt.verify(token, config.secret, (err, user) => {
		if (err) return next(err);
		req.user = user;
		// Pass the execution off to whatever request the client intended
		next();
	});
}

router.get("/login", async (req, res) => {
	res.render("auth/login");
});

router.get("/register", async (req, res) => {
	res.render("auth/register");
});

module.exports = router;
