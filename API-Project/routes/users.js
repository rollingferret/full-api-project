const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { asyncHandler, handleValidationErrors } = require("./utils");
const bcrypt = require('bcryptjs');
const db = require("../db/models");
const { getUserToken } = require("../auth.js");


const validateUsername =
  check("username")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a username");

const validateEmailAndPassword = [
  check("email")
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage("Please provide a valid email."),
  check("password")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a password."),
];


router.post("/", validateUsername, validateEmailAndPassword, handleValidationErrors, asyncHandler(async(req, res, next) => {

  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 2);
  const user = await db.User.create({ username, email, hashedPassword});

  const token = getUserToken(user);
  res.status(201).json({
    user: { id: user.id },
    token,
  });
}));

router.post(
  "/token",
  validateEmailAndPassword,
  asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    console.log(req.body);
    const user = await db.User.findOne({
      where: {
        email,
      },
    });
    console.log(user);
    if (!user || !user.validatePassword(password)) {
      const err = new Error("Login failed");
      err.status = 401;
      err.title = "Login failed";
      err.errors = ["The provided credentials were invalid."];
      return next(err);
    }
    const token = getUserToken(user);
    res.json({ token, user: { id: user.id } });
  }));
module.exports = router;
