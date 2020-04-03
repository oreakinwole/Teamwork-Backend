const express = require('express');
const fs = require('fs');
const { Client } = require('pg');
const cloudinary = require('cloudinary').v2;

const router = express.Router();
const multipart = require('connect-multiparty');
const authmd = require('../middleware/authmd');

const multipartMiddleware = multipart();

const isMyObjectEmpty = require('../utility/index');

router.get('/feed', authmd, async (req, res) => {
    const client = new Client();
    await client.connect();

    client.query('Select * FROM gifs')
        .then((allgifs) => {
            res.status(200).json({
                status: 'success',
                data: allgifs.rows.sort((a, b) => b.articleid - a.articleid),
            });
        })
        .catch((error) => {
            res.status(500).json({
                status: 'error',
                error: `Internal error while trying to query database, ${error}`,
            });
        });
});

router.get('/:id', authmd, async (req, res) => {
    const client = new Client();
    await client.connect();

    client.query('Select * FROM gifs WHERE gifid = $1', [parseInt(req.params.id, 10)])
        .then((gif) => {
            if (gif.rowCount === 0) {
                res.status(401).json({
                    status: 'error',
                    error: 'Gif with the given id not found',
                });
            } else {
                res.status(200).json({
                    status: 'success',
                    data: gif.rows,
                });
            }
        })
        .catch((error) => {
            res.status(500).json({
                status: 'error',
                error: `Internal error while trying to query database, ${error}`,
            });
        });
});

router.post('/', multipartMiddleware, (req, res) => {
    // to be used later on, will be called when problem occurs in storing gif in database
    const deleteImageFromCloudinary = (imageName, err) => {
        cloudinary.uploader.destroy(imageName, { invalidate: true, resource_type: 'image' }, (error) => {
            if (error) {
                return res.status(400).json({
                    status: 'error',
                    error: `Error deleting file from cloudinary and error while trying to store image in database, ${error}`,
                });
            }
            return res.status(500).json({
                status: 'error',
                error: `Internal error while trying to store image in database, ${err}`,
            });
        });
    };

    const file = req.files.image.path;

    if (isMyObjectEmpty(req.files) === true || req.files.image.type.split('/')[1] !== 'gif') {
        res.status(400).json({
            status: 'error',
            error: 'must select a gif image to upload',
        });
        return;
    }


    cloudinary.uploader.upload(file, async (error, result) => {
        if (error) return res.status(400).json({ status: 'error', error: `Bad request or Something failed, ${error}` });
        if (result) {
            const client = new Client();
            await client.connect();

            client.query('INSERT INTO gifs(title, imageurl, createdon) VALUES($1, $2, $3) RETURNING *', [req.body.title, result.url, new Date().toLocaleString()])
                .then((data) => {
                    res.status(201).json({
                        status: 'success',
                        data: {
                            gifId: data.rows[0].gifid,
                            message: 'GIF image successfully posted',
                            createdOn: data.rows[0].createdon,
                            title: data.rows[0].title,
                            imageUrl: data.rows[0].imageurl,
                        },
                    });
                })
                .catch((err) => deleteImageFromCloudinary(result.public_id, err));
        }
    });
});

router.delete('/:id', authmd, async (req, res) => {
    const client = new Client();
    await client.connect();

    client.query('Select * FROM gifs WHERE gifid = $1', [parseInt(req.params.id, 10)])
        .then((data) => {
            if (data.rowCount === 0) {
                res.status(401).json({
                    status: 'error',
                    error: 'Gif with the given id not found',
                });
            } else {
                fs.unlink(`images/${data.rows[0].title}.gif`, () => {
                    client.query('DELETE FROM gifs WHERE gifid = $1', [parseInt(req.params.id, 10)])
                        .then(() => {
                            res.status(200).json({
                                status: 'success',
                                data: {
                                    message: 'gif post successfully deleted',
                                },
                            });
                        })
                        .catch((error) => {
                            res.status(500).json({
                                status: 'error',
                                error: `Internal error while trying to delete gif, ${error}`,
                            });
                        });
                });
            }
        })
        .catch((err) => {
            res.status(500).json({
                status: 'error',
                error: `Internal error while trying to query database, ${err}`,
            });
        });
});

router.post('/:id/comment', authmd, async (req, res) => {
    const client = new Client();
    await client.connect();

    client.query('Select * FROM gifs WHERE gifid = $1', [parseInt(req.params.id, 10)])
        .then((data) => {
            if (data.rowCount === 0) {
                res.status(401).json({
                    status: 'error',
                    error: 'Gif with the given id not found',
                });
            } else {
                const queryT = 'select array_length(comments, 1) as commentlength from gifs where gifid = $1';
                const valueT = [req.params.id];

                client.query(queryT, valueT)
                    .then((dataT) => {
                        let arrayLength = JSON.stringify(dataT.rows[0].commentlength);
                        if (arrayLength === 'null' || arrayLength === 'NULL' || arrayLength === 'Null') arrayLength = 0;
                        arrayLength = parseInt(arrayLength, 10);
                        // to get the domain of the user, to be used for authorid
                        const hostName = req.get('host');
                        const query = 'UPDATE gifs SET comments [$1] = $2 WHERE gifid = $3 RETURNING *';
                        const values = [arrayLength + 1, JSON.stringify({ commentid: `${data.rows[0].gifid}article${Date.now()}`, comment: req.body.comment, authorid: hostName }), parseInt(req.params.id, 10)];
                        client.query(query, values)
                            .then((info) => {
                                res.status(201).json({
                                    status: 'success',
                                    data: {
                                        message: 'Comment successfully created',
                                        createdOn: new Date().toLocaleString(),
                                        gifTitle: info.rows[0].title,
                                        comment: info.rows[0].comments[info.rows[0].comments.length - 1].comment,
                                    },
                                });
                            })
                            .catch((error) => {
                                res.status(500).json({
                                    status: 'error',
                                    error: `Internal error while trying to post comment, ${error}`,
                                });
                            });
                    })
                    .catch((newerr) => {
                        res.status(500).json({
                            status: 'error',
                            error: `Internal error while trying to perform operation on database, ${newerr}`,
                        });
                    });
            }
        })
        .catch((error) => {
            res.status(500).json({
                status: 'error',
                error: `Internal error while trying to query database, ${error}`,
            });
        });
});

module.exports = router;
