import express from "express";

const router = express.Router();

router.get("/resources", (req, res) =>
	res.jsonp([
		{
			name: "Luca",
			age: 30,
			city: "Bærum",
		},
		{
			name: "Andreas",
			age: 42,
			city: "Asker",
		},
	]),
);

export default router;
