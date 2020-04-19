const express = require('express');

const router = express.Router();
// const { Client } = require('pg');

router.get('/', async (req, res) => {
    /*  const client = new Client();
    await client.connect(); */

    res.redirect('https://documenter.getpostman.com/view/6617942/SW7dURNT');
});

module.exports = router;
