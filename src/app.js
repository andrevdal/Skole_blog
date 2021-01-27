#!/usr/bin/env node
const express = require("express");
const path = require("path");
const fs = require("fs");

// Routers
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const apiRouter = require("./routes/api");

const debug = process.env.NODE_ENV === "development";
const app = express();
const config = JSON.parse(
	fs.readFileSync(path.join(__dirname, "..", "confs", "config.json"), "utf-8")
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

if (debug) app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/api", apiRouter);

app.listen(config.port || 5000);
