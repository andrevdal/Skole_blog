import express from "express";
import path from "path";
import apiRouter from "./routes/api";

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => res.render("index"));
app.use("/api", apiRouter);

app.listen(5000);
