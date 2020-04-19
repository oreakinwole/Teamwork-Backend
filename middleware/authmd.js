/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('teamworkToken');
    if (!token) res.status(400).send('No Token provided.');
    if (token) {
        try {
            const headToken = jwt.verify(token, process.env.SECRET_KEY);
            req.user = headToken;
            next();
        } catch (ex) {
            res.status(400).send('Invalid Token provided');
        }
    }
};
