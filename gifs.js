/* eslint-disable no-console */
const express = require('express');
const cloudinary = require('cloudinary').v2;

const router = express.Router();
const authmd = require('./middleware/authmd');

let gifId = 0;
router.post('/', authmd, (req, res) => {
    cloudinary.uploader.upload(req.body.image, (error, result) => { console.log(result, error); });
    res.status(201).json({
        status: 'success',
        data: {
            gifId: gifId + 1,
            message: 'GIF image successfully posted',
            createdOn: new Date().toLocaleDateString,
            title: req.body.title,
            imageUrl: req.body.image,
        },
    });
    gifId += 1;
});

module.exports = router;
