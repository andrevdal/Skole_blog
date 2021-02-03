const express = require("express");
const createError = require("http-errors");
const insane = require("insane");
const marked = require("marked");

const { User } = require("../models/users.js");
const { Blog } = require("../models/blogs.js");
const { find } = require("../utils/server");

const router = express.Router();

router.get("/:username", async (req, res, next) => {
	let user = await find(User, "username", req.params.username);
	if (user) res.render("profile", { user });
	else return next(createError(404));
});

router.get("/:username/:blog", async (req, res, next) => {
	let user = await find(User, "username", req.params.username),
		blog = await find(Blog, "short_name", req.params.blog, {
			author: user?._id,
		});
	if (user && blog) res.render("blog", { user, blog, marked, insane });
	else return next(createError(404));
});

module.exports = router;
