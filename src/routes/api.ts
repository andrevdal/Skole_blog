import express from "express";
import mongoose from "mongoose";

import { sha256 } from "../utils/common";

import { User } from "../models/users";

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

export default router;
