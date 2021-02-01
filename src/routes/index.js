const express = require("express");
const createError = require("http-errors");
const { User } = require("../models/users.js");
const { Blog } = require("../models/blogs.js");
const router = express.Router();

async function find(Schema, name, value, obj = {}) {
	let foo;
	if (isNaN(value)) {
		obj[name] = value;
		foo = await Schema.findOne(obj);
	} else {
		obj["_id"] = value;
		foo = await User.findOne(obj);
	}
	return foo;
}

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
	if (user && blog) res.render("blog", { user, blog });
	else return next(createError(404));
});

module.exports = router;
