const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");
const fileUpload = require("express-fileupload");
const cors = require("cors");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "backend/config/config.env" });
}

// Using Middlewares
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ limit: "50mb", extended: true }));
// app.use(cookieParser());
// app.use(fileUpload);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles: true,
  })
);

app.use(cors());

// Importing Routes
const post = require("./routes/post");
const user = require("./routes/user");

// Using Routes
app.use("/api/v1", post);
app.use("/api/v1", user);

app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
});

app.get("/", (req, res) => {
  res.send("server is running");
});

module.exports = app;
