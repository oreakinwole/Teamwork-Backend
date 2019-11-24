const express = require('express');
const { Client } = require('pg');

const router = express.Router();
const authmd = require('../middleware/authmd');

router.get('/feed', authmd, async (req, res) => {
    const client = new Client({ ssl: true });
    await client.connect();

    client.query('Select * FROM articles')
        .then((allarticles) => {
            res.status(200).json({
                status: 'success',
                data: allarticles.rows.sort((a, b) => b.articleid - a.articleid),
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
    const client = new Client({ ssl: true });
    await client.connect();

    client.query('Select * FROM articles WHERE articleid = $1', [parseInt(req.params.id, 10)])
        .then((article) => {
            if (article.rowCount === 0) {
                res.status(401).json({
                    status: 'error',
                    error: 'Article with the given id not found',
                });
            } else {
                res.status(200).json({
                    status: 'success',
                    data: article.rows,
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

router.post('/', authmd, async (req, res) => {
    const client = new Client({ ssl: true });
    await client.connect();

    client.query('INSERT INTO articles(title, article, createdon) VALUES($1, $2, $3) RETURNING *', [req.body.title, req.body.article, new Date().toLocaleString()])
        .then((data) => {
            res.status(201).json({
                status: 'success',
                data: {
                    message: 'Article successfully posted',
                    articleId: data.rows[0].articleid,
                    createdOn: data.rows[0].createdon,
                    title: data.rows[0].title,
                },
            });
        })
        .catch((error) => {
            res.status(500).json({
                status: 'error',
                error: `Internal error while trying to post article, ${error}`,
            });
        });
});

router.put('/:id', authmd, async (req, res) => {
    const client = new Client({ ssl: true });
    await client.connect();

    client.query('Select * FROM articles WHERE articleid = $1', [parseInt(req.params.id, 10)])
        .then((data) => {
            if (data.rowCount === 0) {
                res.status(401).json({
                    status: 'error',
                    error: 'Article with the given id not found',
                });
            } else {
                client.query('UPDATE articles SET article = $1, title = $2, createdon = $3 WHERE articleid = $4 RETURNING *', [req.body.article, req.body.title, new Date().toLocaleString(), parseInt(req.params.id, 10)])
                    .then((article) => {
                        res.status(200).json({
                            status: 'success',
                            data: {
                                message: 'Article successfully updated',
                                title: article.rows[0].title,
                                article: article.rows[0].article,
                            },
                        });
                    })
                    .catch((error) => {
                        res.status(500).json({
                            status: 'error',
                            error: `Internal error while trying to edit article, ${error}`,
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

router.delete('/:id', authmd, async (req, res) => {
    const client = new Client({ ssl: true });
    await client.connect();

    client.query('Select * FROM articles WHERE articleid = $1', [parseInt(req.params.id, 10)])
        .then((data) => {
            if (data.rowCount === 0) {
                res.status(401).json({
                    status: 'error',
                    error: 'Article with the given id not found',
                });
            } else {
                client.query('DELETE FROM articles WHERE articleid = $1', [parseInt(req.params.id, 10)])
                    .then(() => {
                        res.status(200).json({
                            status: 'success',
                            data: {
                                message: 'Article successfully deleted',
                            },
                        });
                    })
                    .catch((error) => {
                        res.status(500).json({
                            status: 'error',
                            error: `Internal error while trying to delete article, ${error}`,
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

router.post('/:id/comment', authmd, async (req, res) => {
    const client = new Client({ ssl: true });
    await client.connect();

    client.query('Select * FROM articles WHERE articleid = $1', [parseInt(req.params.id, 10)])
        .then((data) => {
            if (data.rowCount === 0) {
                res.status(401).json({
                    status: 'error',
                    error: 'Article with the given id not found',
                });
            } else {
                const queryT = 'select array_length(comments, 1) as commentlength from articles where articleid = $1';
                const valueT = [req.params.id];

                client.query(queryT, valueT)
                    .then((dataT) => {
                        let arrayLength = JSON.stringify(dataT.rows[0].commentlength);
                        if (arrayLength === 'null' || arrayLength === 'NULL' || arrayLength === 'Null') arrayLength = 0;
                        arrayLength = parseInt(arrayLength, 10);
                        // to get the domain of the user, to be used for authorid
                        const hostName = req.get('host');
                        const query = 'UPDATE articles SET comments [$1] = $2 WHERE articleid = $3 RETURNING *';
                        const values = [arrayLength + 1, JSON.stringify({ commentid: `${data.rows[0].articleid}article${Date.now()}`, comment: req.body.comment, authorid: hostName }), parseInt(req.params.id, 10)];
                        client.query(query, values)
                            .then((info) => {
                                res.status(201).json({
                                    status: 'success',
                                    data: {
                                        message: 'Comment successfully created',
                                        createdOn: new Date().toLocaleString(),
                                        articleTitle: info.rows[0].title,
                                        article: info.rows[0].article,
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
