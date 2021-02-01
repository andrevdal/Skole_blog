const createError = require("http-errors");
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
const { Blog } = require("../models/blogs.js");

const router = express.Router();
async function restrict(req, res, next) {
	let user;
	const { type, data } = await decodeAuth(
		req.headers["authorization"] || req.cookies["authorization"]
	);
	// If the request comes from a user
	if (type === "Basic") {
		user = await User.findOne(data).exec();
	} // If a request comes from a bot
	else if (type === "Bearer") {
		if (data) user = await User.findOne(data.user);
	}
	req.user = user;
	if (user) return next();
}
async function decodeAuth(authHeader) {
	let [type, data] = authHeader.split(" ");
	if (type === "Basic") {
		// Decrypt the message
		let [username, hash] = Buffer.from(data, "base64")
			.toString()
			.split(":");
		hash = await sha256(hash);
		return { type, data: { username, hash } };
	} else if (type === "Bearer") {
		try {
			jwt.verify(data);
			data = jwt.decode(data);
			return { type, data };
		} catch (err) {
			return { type, data, err };
		}
	}
}

mongoose.connect("mongodb://localhost/blog", { useNewUrlParser: true });

// Authentification
router.get("/login", async (req, res, next) => {
	let user;
	const expiresIn = 60 * 60;
	const { type, data } = await decodeAuth(req.headers["authorization"]);
	// If the request comes from a user
	if (type === "Basic") {
		user = await User.findOne(data).exec();
	} // If a request comes from a bot
	else if (type === "Bearer") {
		if (data) user = await User.findOne(data.user);
	}
	if (!user) return next(createError(404, "User not found"));
	else
		res.jsonp({
			message: "User Authentificated",
			expiresIn,
			token: jwt.sign(
				{
					user,
				},
				config.secret,
				{
					expiresIn,
				}
			),
		});
});

router.post("/register", async (req, res, next) => {
	// Decrypt the message
	let user;
	const { type, data } = await decodeAuth(req.headers["authorization"]);
	// If the request comes from a user
	if (type === "Basic") {
		user = new User(data);
	} else return next(createError(400, "Only Basic authentification allowed"));
	try {
		await user.save();

		res.jsonp({
			message: "User Saved",
			user,
			token: jwt.sign(
				{
					user,
				},
				config.secret
			),
		});
	} catch (err) {
		res.status(400);
		if (err.name === "MongoError") {
			if (err.keyPattern.username) {
				res.jsonp({
					message:
						"This username has been taken, please try another one",
					err,
				});
			} else {
				res.jsonp({
					message: "A database error has happened. ",
					err,
				});
			}
		} else {
			res.jsonp({
				message: "An error has occured",
				err,
			});
		}
	}
});

router.get("/users", async (req, res) => res.jsonp(await User.find()));

// Blogs

// Save a new blog
router.post("/blogs/new", restrict, async (req, res, next) => {
	if (await Blog.findOne({ short_name: req.body.short_name }))
		return next(createError(409, "Blog already exists with this name"));
	else {
		const blog = new Blog({
			name: req.body.name,
			short_name: req.body.short_name,
			description: req.body.description,
			author: req.user.id,
		});
		try {
			await blog.save();
			res.status(200).jsonp({ blog, message: "Blog saved succesfully" });
		} catch (err) {
			res.status(500).jsonp({ err, blog });
		}
	}
});

router.get("/blogs", async (req, res, next) => {
	const blog = await Blog.findOne({ short_name: req.query.name });
	if (blog) res.status(200).jsonp(blog);
	else return next(createError(404, "Blog not found"));
});

module.exports = router;
