#!/usr/bin/env node
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
// Routers
const indexRouter = require("./routes/index");
const apiRouter = require("./routes/api");

const debug = process.env.NODE_ENV === "development";
let http;
if (debug) http = require("https");
else http = require("http");
const app = express();
const config = JSON.parse(
	fs.readFileSync(path.join(__dirname, "..", "confs", "config.json"), "utf-8")
);
function parseError(req, res, err) {
	res.status(err.status).jsonp({ message: err.message, err });
}

// Config mongoose
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);
mongoose.connect("mongodb://localhost/blog", { useNewUrlParser: true });

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser(config.secret));

app.use("/api", apiRouter);
app.use("/", indexRouter);
app.use((_req, _res, next) => next(createError(404)));

app.use((err, req, res, _next) => {
	// Set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = debug ? err : {};

	// Render the error page
	if (req.path.includes("/api")) parseError(req, res, err);
	else res.status(err.status || 500).render("error");
});

http.createServer(
	{
		key: debug
			? fs.readFileSync(
					path.join(__dirname, "..", "confs", "./server.key")
			  )
			: null,
		cert: debug
			? fs.readFileSync(
					path.join(__dirname, "..", "confs", "./server.cert")
			  )
			: null,
	},
	app
).listen(config.port || 5000, (err) => {
	if (err) console.log(err);
	console.log(
		`Online at ${debug ? "https" : "http"}://localhost:${config.port}/`
	);
});
