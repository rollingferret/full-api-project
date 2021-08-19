const express = require("express");
const morgan = require("morgan");
const { environment } = require('./config');
const indexRouter = require('./routes/index');
const tweetsRouter = require('./routes/tweets');
const usersRouter = require('./routes/users');
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cors({ origin: "http://localhost:4000"}));
app.use(indexRouter);
app.use("/tweets", tweetsRouter);
app.use("/users", usersRouter);

// Catch unhandled requests and forward to error handler.
app.use((req, res, next) => {
  const err = new Error("The requested resource couldn't be found.");
  err.status = 404;
  next(err);
});

// Custom error handlers.

// Generic error handler.
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  const isProduction = environment === "production";
  res.json({
    title: err.title || "Server Error",
    message: err.message,
    errors: err.errors,
    stack: isProduction ? null : err.stack,
  });
});

module.exports = app;
