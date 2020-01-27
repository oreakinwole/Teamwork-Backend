/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
const path = require('path');
require('dotenv').config();
const express = require('express');
const cloudinary = require('cloudinary').v2;
const startDb = require('./startup/startdb');

const auth1 = require('./routes/authv1');
const gifs1 = require('./routes/gifs');
const articles1 = require('./routes/articles');
const home = require('./routes/home');

const app = express();

if (!process.env.SECRET_KEY) {
    throw new Error('SECRET KEY is missing fo this App');
} else {
    console.info('Found SECRET KEY');
}

startDb();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'images')));
// Api Routes
app.use('/', home);
app.use('/api/v1/auth', auth1);
app.use('/api/v1/gifs', gifs1);
app.use('/api/v1/articles', articles1);

// app port configuration
const port = process.env.PORT || 5000;
const server = app.listen(port, () => console.info(`Listening on port ${port}...`));
module.exports = server;
