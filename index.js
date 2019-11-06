/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const cloudinary = require('cloudinary').v2;
const auth1 = require('./authv1');
const gifs1 = require('./gifs');

const app = express();

if (!process.env.SECRET_KEY) {
    throw new Error('SECRET KEY is missing fo this App');
} else {
    console.info('Found SECRET KEY');
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

app.use(express.json());

// Api Routes
app.use('/api/auth', auth1);
app.use('/api/v1/auth', auth1);
app.use('/api/gifs', gifs1);
app.use('/api/v1/gifs', gifs1);


// app port configuration
const port = process.env.PORT || 5000;
const server = app.listen(port, () => console.info(`Listening on port ${port}...`));
module.exports = server;
