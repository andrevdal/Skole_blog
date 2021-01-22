import express from "express";
import mongoose from "mongoose";
import { User } from "../models/users";

mongoose.connect("mongodb://localhost/users", { useNewUrlParser: true });

const router = express.Router();

router.get("/users", async (req, res) => {
	res.jsonp(await User.find());
});

router.get("/login", async (req, res) => {
	res.render("auth/login");
});

router.post("/login", async (req, res) => {
	try {
		const user = await User.find({
			username: req.body.username,
			hash: req.body.hash,
			salt: req.body.salt,
		});
		res.status(200).jsonp({
			message: `Welcome ${req.body.username}`,
		});
	} catch (err) {
		res.status(403).json({ message: `Something went wrong ${err}` });
	}
});

router.get("/register", async (req, res) => {
	res.render("auth/register");
});

router.post("/register", async (req, res) => {
	const user = new User({
		username: req.body.username,
		hash: req.body.hash,
		salt: req.body.salt,
	});
	try {
		await user.save();
		res.status(200).jsonp({
			message: `Welcome ${req.body.username}`,
		});
	} catch (err) {
		res.status(500).jsonp({
			message: `Something went wrong ${err}`
		});
	}
});

export default router;
