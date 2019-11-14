const express = require('express');

const router = express.Router();
const authmd = require('../middleware/authmd');

const articlesData = [];

let articId = 1;

router.get('/feed', authmd, (req, res) => {
    res.status(200).json({
        status: 'success',
        data: articlesData.sort((a, b) => b.id - a.id),
    });
});

router.get('/:id', authmd, (req, res) => {
    const getArticle = articlesData.find((article) => article.id === parseInt(req.params.id, 10));
    if (!getArticle) {
        res.status(401).json({
            status: 'error',
            error: 'Article with the given id not found',
        });
    } else {
        res.status(200).json({
            status: 'success',
            data: getArticle,
        });
    }
});

router.post('/', authmd, (req, res) => {
    const newArticle = { id: articId, title: req.body.title, article: req.body.article };
    articlesData.push(newArticle);
    res.status(201).json({
        status: 'success',
        data: {
            message: 'Article successfully posted',
            articleId: newArticle.id,
            createdOn: Date.now(),
            title: req.body.title,
        },
    });
    articId += 1;
});

router.put('/:id', authmd, (req, res) => {
    const getArticle = articlesData.find((article) => article.id === parseInt(req.params.id, 10));
    if (!getArticle) {
        res.status(401).json({
            status: 'error',
            error: 'Article with the given id not found',
        });
    } else {
        getArticle.title = req.body.title;
        getArticle.article = req.body.article;
        res.status(200).json({
            status: 'success',
            data: {
                message: 'Article successfully updated',
                title: getArticle.title,
                article: getArticle.article,
            },
        });
    }
});

router.delete('/:id', authmd, (req, res) => {
    const findId = articlesData.find((article) => article.id === parseInt(req.params.id, 10));
    if (!findId) {
        res.status(401).json({
            status: 'error',
            error: 'Article with the given id not found',
        });
    } else {
        const index2Delete = articlesData.findIndex((article) => article.id === parseInt(req.params.id, 10));
        articlesData.splice(index2Delete, 1);
        res.status(200).json({
            status: 'success',
            data: {
                message: 'Article successfully deleted',
            },
        });
    }
});

router.post('/:id/comment', authmd, (req, res) => {
    const getArticle = articlesData.find((article) => article.id === parseInt(req.params.id, 10));
    if (!getArticle) {
        res.status(401).json({
            status: 'error',
            error: 'Article with the given id not found',
        });
    } else {
        // to get the domain of the user, to be used for authorid
        const hostName = req.get('host');
        getArticle.comments = [];
        getArticle.comments.push({
            commentId: `${getArticle.id}article${Date.now()}`,
            comment: req.body.comment,
            authorId: hostName,
        });
        res.status(201).json({
            status: 'success',
            data: {
                message: 'Comment successfully created',
                createdOn: Date.now(),
                articleTitle: getArticle.title,
                article: getArticle.article,
                // to get the just posted comment
                comment: getArticle.comments[getArticle.comments.length - 1],
            },
        });
    }
});

module.exports = router;
