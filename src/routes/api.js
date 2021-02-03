const createError = require("http-errors");
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

const { sha256 } = require("../utils/common.js");
const { find } = require("../utils/server");

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
	else
		res.status(401).jsonp({
			message: "No user found",
		});
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
		const user = await find(User, "username", req.params.username);
		if (user) res.status(200).jsonp(user);
		else next(createError(404, "User not found"));
	} else return res.status(200).jsonp(await User.find());
});

router.delete("/users/:username?", restrict, async (req, res, next) => {
	if (req.params.username) {
		if (req.user.admin) {
			const user = await find(User, "username", req.params.username);
			try {
				res.status(204).jsonp({
					message: "User succesfully deleted",
					user: await User.findOneAndDelete(user),
				});
			} catch (err) {
				res.status(304).jsonp({
					message: "The user hasn't been deleted",
					err,
				});
			}
		} else next(createError(404, "No user provided"));
	} else return next(createError(404, "No user provided"));
});

router.get("/user", restrict, (req, res) => res.jsonp(req.user));

router.delete("/user", restrict, async (req, res, next) => {
	//req.user.hash = await sha256(req.body.hash);
	try {
		res.status(200).jsonp({
			message: "User succesfully deleted",
			user: await User.findByIdAndDelete(req.user._id),
		});
	} catch (err) {
		console.log(err);
		res.status(304).jsonp({
			message: "The user hasn't been deleted",
			err,
		});
	}
});

// Blogs

// Save a new blog
router.post("/blogs", restrict, async (req, res, next) => {
	if (await Blog.findOne({ short_name: req.body.short_name }))
		return next(createError(409, "Blog already exists with this name"));
	else {
		const blog = new Blog({
			name: req.body.name,
			short_name: req.body.short_name,
			description: req.body.description,
			data: req.body.data,
			author: req.user._id,
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
		const user = await find(User, "username", req.params.user);
		let blog;
		if (req.params.id) {
			blog = await find(Blog, "short_name", req.params.id);
			if (blog) res.status(200).jsonp(blog);
			else return next(createError(404, "Blog not found"));
		} else {
			blog = await find(Blog, "author", user?._id);
			if(blog) res.status(200).jsonp(blog);
			else return next(createError(404, "No blogs from this user found"))
		}
	} else {
		res.status(200).jsonp(await Blog.find());
	}
});

router.delete("/blogs/:username?/:id", restrict, async (req, res, next) => {
	if (req.params.username) {
		const blog = await find(Blog, "short_name", req.params.id);
		if (blog) {
			if (req.user.admin || req.user._id === blog.author) {
				try {
					res.status(204).jsonp({
						message: "Blog succesfully deleted",
						user: await Blog.findByIdAndDelete(blog?._id),
					});
				} catch (err) {
					res.status(304).jsonp({
						message: "The blog hasn't been deleted",
						err,
					});
				}
			} else return next(createError(403, "Not allowed"));
		} else return next(createError(404, "Blog not found"));
	} else return next(createError(404, "No user provided"));
});

module.exports = router;
