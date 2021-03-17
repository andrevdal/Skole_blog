const createError = require("http-errors");
const express = require("express");
const jwt = require("jsonwebtoken");
const { readFileSync } = require("fs");
const { join } = require("path");

const config = JSON.parse(
	readFileSync(join(__dirname, "..", "..", "confs", "config.json"), "utf-8")
);

const { sha256 } = require("../utils/common.js");
const { find, findAll } = require("../utils/server");

const { User } = require("../models/users.js");
const { Blog } = require("../models/blogs.js");

const router = express.Router();
async function restrict(req, res, next) {
	let user;
	try {
		var { type, data, err } = await decodeAuth(
			req.headers["authorization"] || req.cookies["token"]
		);
	} catch (err) {
		var err = err;
	}
	if (err)
		return next(
			createError(401, {
				message: "Unauthorized",
				err,
			})
		);
	// If the request comes from a user
	if (type === "Basic") {
		user = await User.findOne(data);
	} // If a request comes from a bot
	else if (type === "Bearer") {
		if (data) user = await User.findById(data.user.id);
	}
	req.user = user;
	if (user) return next();
	else
		res.status(401).jsonp({
			message: "No user found",
		});
}
async function decodeAuth(auth) {
	let [type, data] = auth?.split(" ");
	if (type === "Basic") {
		// Decrypt the message
		let [username, hash] = Buffer.from(data, "base64")
			.toString()
			.split(":");
		hash = await sha256(hash);
		return { type, data: { username, hash } };
	} else if (type === "Bearer") {
		try {
			try {
				data = jwt.decode(data, config.secret);
			} catch (err) {
				return { type, data, err };
			}
			return { type, data };
		} catch (err) {
			return { type, data, err };
		}
	}
}

// Authentification
router.get("/login", async (req, res, next) => {
	let user;
	const expiresIn = 60 * 60 * 1000;
	try {
		var { type, data } = await decodeAuth(
			req.headers["authorization"] || req.cookies["token"]
		);
	} catch (err) {
		return next(
			createError(401, {
				message: "Unauthorized",
				err,
			})
		);
	}
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
	try {
		var { type, data } = await decodeAuth(
			req.headers["authorization"] || req.cookies["token"]
		);
	} catch (err) {
		return next(
			createError(401, {
				message: "Unauthorized",
				err,
			})
		);
	}
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
router.get("/users/:username?", async (req, res, next) => {
	let { offset, max, orderby: sort, direction } = req.query;
	offset = parseInt(offset);
	max = parseInt(max);
	if (direction === "desc") direction = -1;
	else direction = 1;
	if (req.params.username) {
		const user = await find(User, "username", req.params.username);
		if (user) res.status(200).jsonp(user);
		else next(createError(404, "User not found"));
	} else
		return (
			res.status(200).jsonp(
				await findAll(User, null, undefined, undefined, {
					offset,
					max,
					sort,
					direction,
				})
			) || ""
		);
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

router.patch("/users/:user", restrict, async (req, res, next) => {
	const user = await find(User, "username", req.params.user);
	if (req.user.id !== user.id || req.user.admin)
		return next(createError(403, "Not allowed"));
	const update = req.body;
	if (update.hash) {
		if ((await sha256(update.hash)) === user.hash)
			update.hash = await sha256(update.hash);
		else return next(createError(403, "Wrong password"));
	}
	try {
		res.jsonp({
			user: await User.findByIdAndUpdate(user.id, update),
		});
	} catch (err) {
		console.log(err);
		return next(createError(err));
	}
});

router.get("/user", restrict, (req, res) => res.jsonp(req.user));

router.delete("/user", restrict, async (req, res, next) => {
	const user = await User.findOne({
		_id: req.user._id,
		hash: await sha256(req.body.hash),
	});
	if (user) {
		if (req.body.keep === true) {
			const archive_user = await User.findOne({ username: "archive" });
			try {
				await Blog.updateMany(
					{ author: user._id },
					{ author: archive_user._id }
				);
				res.status(200).jsonp({
					message: "User succesfully deleted",
					user: await User.findByIdAndDelete(user._id),
				});
			} catch (err) {
				console.log(err);
				res.status(304).jsonp({
					message: "The user hasn't been deleted",
					err,
				});
			}
		} else {
			try {
				await Blog.deleteMany({ author: user._id });
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
		}
	} else res.status(403).jsonp({ message: "Wrong password provided" });
});

router.patch("/user", restrict, async (req, res, next) => {
	const update = req.body;
	if (update.hash) {
		if ((await sha256(update.hash)) === req.user.hash)
			update.hash = await sha256(update.hash);
		else return next(createError(403, "Wrong password"));
	}
	try {
		res.jsonp({
			user: await User.findByIdAndUpdate(req.user.id, update),
		});
	} catch (err) {
		console.log(err);
		return next(createError(err));
	}
});

// Blogs
router.post("/blogs", restrict, async (req, res, next) => {
	if (
		await Blog.findOne({
			short_name: req.body.short_name,
			author: req.user._id,
		})
	)
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
	const embeds =
		req.query.embed?.replaceAll(/\s/g, "").toLowerCase().split(",") || [];
	let { offset, max, orderby: sort, direction } = req.query;
	offset = parseInt(offset);
	max = parseInt(max);
	if (direction === "desc") direction = -1;
	else direction = 1;
	let filter = "";
	if (embeds.indexOf("data") === -1 && !req.params.id) filter += " -data";
	if (req.params.user) {
		const user = await find(User, "username", req.params.user);
		if (!user) return next(createError(404, "User not found"));
		let blog;
		if (req.params.id) {
			blog = await find(
				Blog,
				"short_name",
				req.params.id,
				{
					author: user._id,
				},
				{ filter, populate: embeds[embeds.indexOf("author")] || "" }
			);
			if (blog) {
				res.status(200).jsonp(blog);
			} else return next(createError(404, "Blog not found"));
		} else {
			blog = await findAll(
				Blog,
				null,
				undefined,
				{
					author: user._id,
				},
				{
					filter,
					populate: embeds[embeds.indexOf("author")] || "",
					offset,
					max,
					sort,
					direction,
				}
			);
			if (blog) {
				res.status(200).jsonp(blog);
			} else
				return next(createError(404, "No blogs from this user found"));
		}
	} else {
		res.status(200).jsonp(
			(await findAll(Blog, null, undefined, undefined, {
				filter,
				populate: embeds[embeds.indexOf("author")],
				offset,
				max,
				sort,
				direction,
			})) || ""
		);
	}
});

router.delete("/blogs/:username?/:id", restrict, async (req, res, next) => {
	if (req.params.username) {
		const user = await find(User, "username", req.params.username);
		const blog = await find(Blog, "short_name", req.params.id, {
			author: user.id,
		});
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

router.patch("/blogs/:user/:blog", restrict, async (req, res, next) => {
	const user = await find(User, "username", req.params.user);
	if (user.id !== req.user.id || req.user.admin)
		return next(createError(403, "Not allowed"));
	const blog = await find(Blog, "short_name", req.params.blog, {
		author: user._id,
	});
	if (!blog) return next(createError(404, "No blog found"));
	try {
		res.jsonp({
			blog: await Blog.findByIdAndUpdate(blog._id, req.body),
		});
	} catch (err) {
		return next(createError(500, err));
	}
});

router.get("/", (_req, res) =>
	res.jsonp(
		router.stack
			.filter((r) => r.route)
			.map((r) => {
				return {
					method: Object.keys(r.route.methods)[0].toUpperCase(),
					path: r.route.path,
					restricted: r.route.stack[0].name === "restrict",
				};
			})
			.sort((a, b) => a.method.localeCompare(b.method))
	)
);

// Functions to run when the website starts up
(async () => {
	const user = new User({
		username: "archive",
		hash: await sha256(config.secret),
		bio:
			"A user to save deleted blogs. This account is automated and not a real human. ",
	});
	const blog = new Blog({
		name: "What is this user?",
		short_name: "readme",
		description: "The purpose of this user revealed",
		data: `# Who are you?
This user is created automatically by the server. It's purpose is to archive blogs from users that want to delete their account but don't want to delete their blogs. 
As a side note it's also used for testing. 
`,
		author: user._id,
	});
	try {
		await user.save();
		await blog.save();
	} catch (err) {
		console.log("Website is not running for the first time");
	}
})();

module.exports = router;
