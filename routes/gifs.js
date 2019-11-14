const express = require('express');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

const router = express.Router();
const authmd = require('../middleware/authmd');
const multer = require('../middleware/multer-config');

const gifData = [];

let gifId = 0;

router.get('/feed', authmd, (req, res) => {
    res.status(200).json({
        status: 'success',
        data: gifData.sort((a, b) => b.id - a.id),
    });
});

router.get('/:id', authmd, (req, res) => {
    const getGif = gifData.find((gif) => gif.id === parseInt(req.params.id, 10));
    if (!getGif) {
        res.status(401).json({
            status: 'error',
            error: 'Gif with the given id not found',
        });
    } else {
        res.status(200).json({
            status: 'success',
            data: getGif,
        });
    }
});

router.post('/', [authmd, multer], (req, res) => {
    if (!req.file || req.file.filename.split('.')[1] !== 'gif') {
        res.status(400).json({
            status: 'error',
            error: 'must select a gif image to upload',
        });
    }
    cloudinary.uploader.upload(`images/${req.file.filename}`, (error, result) => {
        if (error) res.status(400).json({ status: 'error', error: 'Bad request or Something failed' });
        if (result) {
            const newGif = { id: gifId + 1, name: result.original_filename, imageUrl: result.url };
            gifData.push(newGif);
            res.status(201).json({
                status: 'success',
                data: {
                    gifId: newGif.id,
                    message: 'GIF image successfully posted',
                    createdOn: Date.now(),
                    title: req.body.title,
                    imageUrl: result.url,
                },
            });
            gifId += 1;
        }
    });
});

router.delete('/:id', authmd, (req, res) => {
    const getGif = gifData.find((gif) => gif.id === parseInt(req.params.id, 10));
    if (!getGif) {
        res.status(401).json({
            status: 'error',
            error: 'Gif with the given id not found',
        });
    } else {
        fs.unlink(`images/${getGif.name}.gif`, () => {
            const index2Delete = gifData.findIndex((gif) => gif.id === parseInt(getGif.id, 10));
            gifData.splice(index2Delete, 1);
            res.status(200).json({
                status: 'success',
                data: {
                    message: 'Gif successfully deleted',
                },
            });
        });
    }
});

router.post('/:id/comment', authmd, (req, res) => {
    const getGif = gifData.find((gif) => gif.id === parseInt(req.params.id, 10));
    if (!getGif) {
        res.status(401).json({
            status: 'error',
            error: 'Gif with the given id not found',
        });
    } else {
        // to get the domain of the user, to be used for authorid
        const hostName = req.get('host');
        getGif.comments = [];
        getGif.comments.push({
            commentId: `${getGif.id}gif${Date.now()}`,
            comment: req.body.comment,
            authorId: hostName,
        });
        res.status(201).json({
            status: 'success',
            data: {
                message: 'Comment successfully created',
                createdOn: Date.now(),
                gifTitle: getGif.title,
                // to get the just posted comment
                comment: getGif.comments[getGif.comments.length - 1],
            },
        });
    }
});

module.exports = router;
