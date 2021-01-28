const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const config = JSON.parse(
	fs.readFileSync(
		path.join(__dirname, "..", "..", "confs", "config.json"),
		"utf-8"
	)
);

const { sha256 } = require("../utils/common.js");

const { User } = require("../models/users.js");

const router = express.Router();
function authenticateToken(req, res, next) {
	// Gather the jwt access token from the request header
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];
	// If there isn't any token
	if (token == null) return res.sendStatus(401);

	jwt.verify(token, config.secret, (err, user) => {
		if (err) return next(err);
		req.user = user;
		// Pass the execution off to whatever request the client intended
		next();
	});
}

mongoose.connect("mongodb://localhost/users", { useNewUrlParser: true });

router.get("/login", async (req, res) => {
	// Decrypt the message
	const auth = Buffer.from(
		req.headers["authorization"]?.split(" ")[1] || "",
		"base64"
	)
		.toString()
		.split(":");
	auth[1] = await sha256(auth[1]);
	// Find the user
	const user = await User.findOne({
		username: auth[0],
		hash: auth[1],
	}).exec();

	if (!user) res.jsonp({ message: "User not found" });
	else
		res.jsonp({
			message: "User Authentificated",
			user: { username: auth[0] },
			token: jwt.sign(
				{
					user: auth[0],
				},
				config.secret
			),
		});
});

router.get("/register", async (req, res) => {
	// Decrypt the message
	const auth = Buffer.from(
		req.headers["authorization"]?.split(" ")[1] || "",
		"base64"
	)
		.toString()
		.split(":");
	auth[1] = await sha256(auth[1]);
	// Make the user and save them
	const user = new User({
		username: auth[0],
		hash: auth[1],
	});
	try {
		await user.save();

		res.jsonp({
			message: "User Saved",
			user: { username: auth[0] },
			token: jwt.sign(
				{
					username: auth[0],
				},
				config.secret
			),
		});
	} catch (err) {
		res.jsonp({
			message: "An error has occured when saving the usr",
			err,
		});
	}
});

router.get("/secret", authenticateToken, (req, res) =>
	res.jsonp({ lul: "kekw" })
);

module.exports = router;
