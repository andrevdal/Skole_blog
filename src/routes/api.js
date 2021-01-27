const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const { sha256 } = require("../utils/common.js");

const { User } = require("../models/users.js");

const router = express.Router();
mongoose.connect("mongodb://localhost/users", { useNewUrlParser: true });

router.get("/login", async (req, res) => {
	const auth = Buffer.from(
		req.headers["authorization"]?.split(" ")[1] || "",
		"base64"
	)
		.toString()
		.split(":");
	const user = User.findOne({
		username: auth[0],
		password: await sha256(auth[1]),
	});
	if (!user) res.jsonp({ message: "User not found" });
	else
		res.jsonp({
			message: "User Authentificated",
			user: { username: auth[0] },
			token: jwt.sign({
				user: "luca"
			},"wdawd")
		});
});

router.get("/login", async (req, res) => {
	const auth = Buffer.from(
		req.headers["authorization"]?.split(" ")[1] || "",
		"base64"
	)
		.toString()
		.split(":");
	const user = User.findOne({
		username: auth[0],
		password: await sha256(auth[1]),
	});
	if (!user) res.jsonp({ message: "User not found" });
	else
		res.jsonp({
			message: "User Authentificated",
			user: { username: auth[0] },
		});
});

module.exports = router;
