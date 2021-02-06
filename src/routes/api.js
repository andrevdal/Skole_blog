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
			jwt.verify(data);
			data = jwt.decode(data);
			return { type, data };
		} catch (err) {
			return { type, data, err };
		}
	}
}

// Authentification

/**
 * @openapi
 * /api/login:
 *   get:
 *     summary: Login as a user.
 *     security:
 *       - basicAuth: []
 *       - JWT: []
 *     responses:
 *       200:
 *         description: Succesfull login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message to be shown on screen
 *                   example: User Authentificated
 *                 expiresIn:
 *                   type: number
 *                   description: When the provided token expires in ms
 *                   example: 3600
 *                 token:
 *                   type: string
 *                   description: A token to be used from now on for authentification
 *                   example: sdnauiwhbfduiwehbfikewhuifkhn
 *       401:
 *         description: Bad login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message to be shown on screen
 *                   example: Unauthorized
 *                 err:
 *                   type: object
 *                   example: {}
 */
router.get("/login", async (req, res, next) => {
	let user;
	const expiresIn = 60 * 60;
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

/**
 * @openapi
 * /api/register:
 *   post:
 *     summary: Register a new user.
 *     security:
 *       - basicAuth: []
 *       - JWT: []
 *     responses:
 *       200:
 *         description: Succesfull register
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message to be shown on screen
 *                   example: User Saved
 *                 user:
 *                   type: object
 *                   description: The newly created user
 *                   properties:
 *                     external:
 *                       type: object
 *                       properties:
 *                         twitter:
 *                           type: object
 *                           properties:
 *                             show:
 *                               type: boolean
 *                         youtube:
 *                           type: object
 *                           properties:
 *                             show:
 *                               type: boolean
 *                         twitch:
 *                           type: object
 *                           properties:
 *                             show:
 *                               type: boolean
 *                         admin:
 *                           type: boolean
 *                         username:
 *                           type: string
 *                           example: luca
 *                         created_at:
 *                           type: string
 *                           example: 2021-02-04T07:47:58.780Z
 *                         id:
 *                           type: string
 *                           example: 12438958361452544
 *                 expiresIn:
 *                   type: number
 *                   description: When the provided token expires in ms
 *                   example: 3600
 *                 token:
 *                   type: string
 *                   description: A token to be used from now on for authentification
 *                   example: sdnauiwhbfduiwehbfikewhuifkhn
 *       400:
 *         description: Error when saving
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message to be shown on screen
 *                   example: User already exists
 *                 err:
 *                   type: object
 *                   example: "MongoError"
 *       401:
 *         description: Bad authentification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message to be shown on screen
 *                   example: Unauthorized
 *                 err:
 *                   type: object
 *                   example: {}
 */
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

/**
 * @openapi
 * /api/users/{user}:
 *   get:
 *     summary: Get user.
 *     parameters:
 *       - name: user
 *         in: path
 *         required: false
 *         description: The user you want. If no users are provided it will return all users. Either a user ID or a username.
 *         allowEmptyValue: true
 *         schema:
 *           type: string
 *           format: string
 *           max: 1
 *           nullable: true
 *     responses:
 *       200:
 *         description: Succesfull request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 external:
 *                   type: object
 *                   properties:
 *                     twitter:
 *                       type: object
 *                       properties:
 *                         show:
 *                           type: boolean
 *                     youtube:
 *                       type: object
 *                       properties:
 *                         show:
 *                           type: boolean
 *                     twitch:
 *                       type: object
 *                       properties:
 *                         show:
 *                           type: boolean
 *                     admin:
 *                       type: boolean
 *                     username:
 *                       type: string
 *                       example: luca
 *                     created_at:
 *                       type: string
 *                       example: 2021-02-04T07:47:58.780Z
 *                     id:
 *                       type: string
 *                       example: 12438958361452544
 */
router.get("/users/:username?", async (req, res, next) => {
	if (req.params.username) {
		const user = await find(User, "username", req.params.username);
		if (user) res.status(200).jsonp(user);
		else next(createError(404, "User not found"));
	} else return res.status(200).jsonp(await User.find());
});

/**
 * @openapi
 * /api/users/{user}:
 *   delete:
 *     summary: Delete user. Requires admin permissions.
 *     security:
 *       - basicAuth: []
 *       - JWT: []
 *     parameters:
 *       - name: user
 *         in: path
 *         required: true
 *         description: The user you want. Either a user ID or a username.
 *         schema:
 *           type: string
 *           format: string
 *           max: 1
 *     responses:
 *       204:
 *         description: Succesfully deleted. Returns the deleted user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 external:
 *                   type: object
 *                   properties:
 *                     twitter:
 *                       type: object
 *                       properties:
 *                         show:
 *                           type: boolean
 *                     youtube:
 *                       type: object
 *                       properties:
 *                         show:
 *                           type: boolean
 *                     twitch:
 *                       type: object
 *                       properties:
 *                         show:
 *                           type: boolean
 *                     admin:
 *                       type: boolean
 *                     username:
 *                       type: string
 *                       example: luca
 *                     created_at:
 *                       type: string
 *                       example: 2021-02-04T07:47:58.780Z
 *                     id:
 *                       type: string
 *                       example: 12438958361452544
 *       304:
 *         description: Something went wrong
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: The user hasn't been deleted
 *       404:
 *         description: No user found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       401:
 *         description: Bad authentification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message to be shown on screen
 *                   example: Unauthorized
 *                 err:
 *                   type: object
 *                   example: {}
 */
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

/**
 * @openapi
 * /api/user:
 *   get:
 *     summary: Get authentificated user.
 *     security:
 *       - basicAuth: []
 *       - JWT: []
 *     responses:
 *       200:
 *         description: Succesfull request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 external:
 *                   type: object
 *                   properties:
 *                     twitter:
 *                       type: object
 *                       properties:
 *                         show:
 *                           type: boolean
 *                     youtube:
 *                       type: object
 *                       properties:
 *                         show:
 *                           type: boolean
 *                     twitch:
 *                       type: object
 *                       properties:
 *                         show:
 *                           type: boolean
 *                     admin:
 *                       type: boolean
 *                     username:
 *                       type: string
 *                       example: luca
 *                     created_at:
 *                       type: string
 *                       example: 2021-02-04T07:47:58.780Z
 *                     id:
 *                       type: string
 *                       example: 12438958361452544
 */
router.get("/user", restrict, (req, res) => res.jsonp(req.user));

/**
 * @openapi
 * /api/user:
 *   delete:
 *     summary: Delete user. 
 *     security:
 *       - basicAuth: []
 *       - JWT: []
 *     responses:
 *       204:
 *         description: Succesfully deleted. Returns the deleted user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 external:
 *                   type: object
 *                   properties:
 *                     twitter:
 *                       type: object
 *                       properties:
 *                         show:
 *                           type: boolean
 *                     youtube:
 *                       type: object
 *                       properties:
 *                         show:
 *                           type: boolean
 *                     twitch:
 *                       type: object
 *                       properties:
 *                         show:
 *                           type: boolean
 *                     admin:
 *                       type: boolean
 *                     username:
 *                       type: string
 *                       example: luca
 *                     created_at:
 *                       type: string
 *                       example: 2021-02-04T07:47:58.780Z
 *                     id:
 *                       type: string
 *                       example: 12438958361452544
 *       304:
 *         description: Something went wrong
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: The user hasn't been deleted
 *       404:
 *         description: No user found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       401:
 *         description: Bad authentification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message to be shown on screen
 *                   example: Unauthorized
 *                 err:
 *                   type: object
 *                   example: {}
 */
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

// Blogs

/**
 * @openapi
 * /api/blogs:
 *   post:
 *     summary: Upload a new blog
 *     security:
 *       - basicAuth: []
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: blog
 *         description: The blog to create.
 *         schema:
 *           type: object
 *           required:
 *             - name
 *           properties:
 *             name:
 *               type: string
 *             short_name:
 *               type: string
 *             description:
 *               type: string
 *             data:
 *               type: string
 *     responses:
 *       200:
 *         description: Blog saved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 description:
 *                   type: string
 *                   example: Really scary
 *                 data:
 *                   type: string
 *                   example: "## Hello world!"
 *                 name:
 *                   type: string
 *                   example: Virus.exe
 *                 short_name:
 *                   type: string
 *                   example: virus
 *                 author:
 *                   type: string
 *                   example: 12438958361452544
 *                 id:
 *                   type: string
 *                   example: 12486445617029120
 *       409:
 *         description: Blog already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Blog already exists with this name
 */
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

/**
 * @openapi
 * /api/blogs/{user}/{blog}:
 *   get:
 *     summary: Get blog
 *     parameters:
 *       - name: user
 *         in: path
 *         required: false
 *         description: The user you want. If no users and blogs are provided it will return all blogs in form of an array. Either a user ID or a username.
 *         allowEmptyValue: true
 *         schema:
 *           type: string
 *           format: string
 *           max: 1
 *           nullable: true
 *       - name: blog
 *         in: path
 *         required: false
 *         description: The blog you want. If not provided it will return all blogs in form of an array from this user. Either a blog ID or a blog's short_name.
 *         allowEmptyValue: true
 *         schema:
 *           type: string
 *           format: string
 *           max: 1
 *           nullable: true
 *     responses:
 *       200:
 *         description: Succesfull request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 description:
 *                   type: string
 *                   example: Really scary
 *                 data:
 *                   type: string
 *                   example: "## Hello world!"
 *                 name:
 *                   type: string
 *                   example: Virus.exe
 *                 short_name:
 *                   type: string
 *                   example: virus
 *                 author:
 *                   type: string
 *                   example: 12438958361452544
 *                 id:
 *                   type: string
 *                   example: 12486445617029120
 *       404:
 *         description: No blog found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User/Blog not found
 */
router.get("/blogs/:user?/:id?", async (req, res, next) => {
	if (req.params.user) {
		const user = await find(User, "username", req.params.user);
		let blog;
		if (req.params.id) {
			blog = await find(Blog, "short_name", req.params.id);
			if (blog) res.status(200).jsonp(blog);
			else return next(createError(404, "Blog not found"));
		} else {
			blog = await Blog.find({ author: user?.id });
			if (blog) res.status(200).jsonp(blog);
			else return next(createError(404, "No blogs from this user found"));
		}
	} else {
		res.status(200).jsonp(await Blog.find());
	}
});

/**
 * @openapi
 * /api/blogs/{user}/{blog}:
 *   delete:
 *     summary: Delete a blog. Available to owners or admins.
 *     security:
 *       - basicAuth: []
 *       - JWT: []
 *     parameters:
 *       - name: user
 *         in: path
 *         required: true
 *         description: The user you want. Either a user ID or a username.
 *         schema:
 *           type: string
 *           format: string
 *           max: 1
 *       - name: blog
 *         in: path
 *         required: true
 *         description: The blog you want. Either a blog ID or a blog's short_name.
 *         schema:
 *           type: string
 *           format: string
 *           max: 1
 *     responses:
 *       204:
 *         description: Succesfully deleted. Returns the deleted blog.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 description:
 *                   type: string
 *                   example: Really scary
 *                 data:
 *                   type: string
 *                   example: "## Hello world!"
 *                 name:
 *                   type: string
 *                   example: Virus.exe
 *                 short_name:
 *                   type: string
 *                   example: virus
 *                 author:
 *                   type: string
 *                   example: 12438958361452544
 *                 id:
 *                   type: string
 *                   example: 12486445617029120
 *       404:
 *         description: No blog found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User/Blog not found
 *       401:
 *         description: Bad authentification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message to be shown on screen
 *                   example: Unauthorized
 *                 err:
 *                   type: object
 *                   example: {}
 */
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

// Functions to run when the website starts up
(async () => {
	const user = new User({
		username: "archive",
		hash: await sha256(config.secret),
	});
	try {
		await user.save();
	} catch (err) {
		console.log("Website is not running for the first time");
	}
})();

module.exports = router;
