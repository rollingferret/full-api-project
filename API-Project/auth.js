const jwt = require("jsonwebtoken");
const { jwtConfig } = require("./config");
const bearerToken = require("express-bearer-token");
const { User } = require('./db/models');


const { secret, expiresIn } = jwtConfig;

const restoreUser = (req, res, next) => {
    const token = req.token;

    if (!token) {
        // res.send('There is no token D:')
        return res.set("WWW-Authenticate", "Bearer").status(401).end();
    }

    return jwt.verify(token, secret, null, async(err, jwtPayload) => {
        if (err) {
            err.status = 401;
            return next(err);
        }

        const {id} = jwtPayload.data

        // const user = await User.findByPk(id);
        // if (user === null) {
        //     throw new Error('User not found!')
        // }

        // next()

        try {
            req.user = await User.findByPk(id);
          } catch (e) {
            return next(e);
          }

        if (!req.user) {
            return res.set("WWW-Authenticate", "Bearer").status(401).end();
        }

        return next();
    });
};

const getUserToken = (user) => {
    const userDataForToken = {
        id: user.id,
        email: user.email
    }

    const token = jwt.sign(
        { data: userDataForToken },
        secret,
        { expiresIn: parseInt(expiresIn, 10) }
    );

    return token;
}

const requireAuth = [bearerToken(), restoreUser];

module.exports = { getUserToken, requireAuth };
