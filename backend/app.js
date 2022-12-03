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
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
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
const conversations = require("./routes/conversations");
const messages = require("./routes/messages");

// Using Routes
app.use("/api/v1", post);
app.use("/api/v1", user);
app.use("/api/conversations", conversations);
app.use("/api/messages", messages);

app.use(express.static(path.join(__dirname, "../frontend/src")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/src/index.js"));
});

module.exports = app;
