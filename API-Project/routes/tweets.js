const express = require("express");
//const { set } = require("../app");
const router = express.Router();
const db = require("../db/models");
const { Tweet } = db;
const {check, validationResult} = require('express-validator');

const asyncHandler = (handler) => {
    return (req, res, next) => {
        return handler(req, res, next).catch(next)
    }
}

router.get("/", asyncHandler(async(req, res, next) => {
    const tweets = await Tweet.findAll()
    res.json({ tweets });
}));

router.get("/:id(\\d+)", asyncHandler(async(req, res, next) => {
    const tweetId = req.params.id;
    const tweet = await Tweet.findByPk(tweetId)
    if (tweet) {
        res.json({ tweet });
    } else {
        next(tweetNotFoundError(tweetId));
    }
}));

const tweetValidators = [
    check('message')
        .exists({checkFalsy:true})
        .withMessage('Please provide a message')
        .isLength({ max: 280 })
        .withMessage('Message cannot exceed 280 characters')
]

const handleValidationErrors = (req, res, next) => {
    const validationErrors = validationResult(req);
    if(!validationErrors.isEmpty()){
        const errors = validationErrors.array().map((error) => error.msg);

        const err = Error("Bad request.");
        err.errors = errors;
        err.status = 400;
        err.title = "Bad request.";
        return next(err);
    }
    next();
}

router.post("/", tweetValidators, handleValidationErrors, asyncHandler(async(req, res, next) => {
    const {message} = req.body;
    res.json(message);
}))

router.put("/:id(\\d+)", asyncHandler(async(req, res, next) => {
    const tweetId = req.params.id;
    const tweet = await Tweet.findByPk(tweetId)
    if (tweet) {
        tweet.message = req.body.message;
        res.json({ tweet });
    } else {
        next(tweetNotFoundError(tweetId));
    }
}));

router.delete("/:id(\\d+)", asyncHandler(async(req, res, next) => {
    const tweetId = req.params.id;
    const tweet = await Tweet.findByPk(tweetId)
    if (tweet) {
        await tweet.destroy();
        res.json({"message": "Successful"})
    } else {
        next(tweetNotFoundError(tweetId));
    }
}));

function tweetNotFoundError(tweetId) {
   const error = new Error(`Tweet ${tweetId} was not found!`);
   error.status = 404;
   error.title = 'tweetNotFoundError';
   return error;
}


module.exports = router;
