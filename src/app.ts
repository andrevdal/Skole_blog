import express from "express";
import path from "path";
import fs from "fs";

// Models
import { Config } from "./models/config";

// Routers
import apiRouter from "./routes/api";

let debug: boolean;
const app = express();
const config: Config = JSON.parse(
	fs.readFileSync(path.join(__dirname, "confs", "config.json"), "utf-8")
);

if (process.env.NODE_ENV === "development") debug = true;
else debug = false;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

if (debug) app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded());
app.use(express.json());

app.get("/", (req, res) => res.render("index"));
app.use("/api", apiRouter);

app.listen(config.port || 5000);
