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
	try {
		var { type, data } = await decodeAuth(
			req.headers["authorization"] || req.cookies["token"]
		);
	} catch (err) {
		return res.status(401).jsonp({
			message: "Unauthorized",
			err,
			something: req.headers["authorization"],
			else: req.cookies["authorization"],
		});
	}
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
async function decodeAuth(auth) {
	let [type, data] = auth.split(" ");
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
// Users

router.get("/users/:username?", async (req, res) => {
	if (req.params.username) {
		const user = await User.findOne({ username: req.params.username });
		if (user) res.status(200).jsonp(user);
		else res.status(404).jsonp({ message: "User not found" });
	} else return res.status(200).jsonp(await User.find());
});

router.get("/user", restrict, (req, res) => res.jsonp(req.user));

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

router.get("/blogs/:user?/:id?", async (req, res, next) => {
	if (req.params.user) {
		let author_id;
		if (isNaN(req.params.user)) {
			const user = await User.findOne({ username: req.params.user });
			author_id = user.id;
		} else {
			author_id = req.params.user;
		}
		if (req.params.id) {
			if (isNaN(req.params.id)) {
				const blog = await Blog.findOne({
					short_name: req.params.id,
					author: author_id,
				});
				if (blog) res.status(200).jsonp(blog);
				else return next(createError(404, "Blog not found"));
			} else {
				const blog = await Blog.findOne({
					_id: req.params.id,
					author: author_id,
				});
				if (blog) res.status(200).jsonp(blog);
				else return next(createError(404, "Blog not found"));
			}
		} else res.status(200).jsonp(await Blog.find({ author: author_id }));
	} else {
		res.status(200).jsonp(await Blog.find());
	}
});

module.exports = router;
