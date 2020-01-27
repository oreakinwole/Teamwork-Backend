const express = require('express');

const router = express.Router();
const { Client } = require('pg');

router.get('/', async (req, res) => {
    /* const client = new Client();
    await client.connect();

    const queryEmail = 'select * from users where userid=$1';
    const value = [1];

    client.query(queryEmail, value)
        .then((resultdata) => res.status(200).json({
            status: 'success',
            data: resultdata,
        }))
        .catch((err) => res.status(500).json({
            status: 'error',
            err,
        })); */
    res.redirect('https://documenter.getpostman.com/view/6617942/SW7dURNT');
});

module.exports = router;
