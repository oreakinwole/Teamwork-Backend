/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');
const { Client } = require('pg');

const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const authmd = require('../middleware/authmd');
const adminCheck = require('../middleware/admin');

// User Sign in Route
router.post('/signin', async (req, res) => {
    const client = new Client();
    await client.connect();

    const queryEmail = 'SELECT * FROM users where email = $1';
    const value = [req.body.email];

    // Check for the user with the email address
    client.query(queryEmail, value)
        .then((result) => {
            if (result.rowCount === 0) {
                res.status(400).json({
                    status: 'error',
                    error: 'Invalid email or password',
                });
                return;
            }

            // Check if the password is valid
            bcrypt.compare(req.body.password, result.rows[0].password)
                .then((validPassword) => {
                    if (!validPassword) {
                        res.status(400).json({
                            status: 'error',
                            error: 'Invalid email or password',
                        });
                    } else {
                        // Generate Jwt Token
                        const token = jwt.sign({
                            userId: result.rows[0].userid,
                            firstName: result.rows[0].firstname,
                            admin: result.rows[0].admin,
                        },
                        process.env.SECRET_KEY, { expiresIn: 7200 });
                        res.status(200).json({
                            status: 'success',
                            data: {
                                token,
                                userId: result.rows[0].userid,
                            },
                        });
                    }
                })
                .catch((error) => {
                    res.status(500).json({ status: 'error', error });
                });
        })
        .catch((error) => {
            res.status(500).json({ status: 'error', error });
        });
});

// Create New User Route
router.post('/create-user', [authmd, adminCheck], async (req, res) => {
    const client = new Client();
    await client.connect();

    // hash the password in the request body
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // insert Admin User
    const text = 'INSERT INTO users(firstname, lastname, email, password, gender, jobrole, department, address) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *';
    const values = [req.body.firstname, req.body.lastname, req.body.email, hashedPassword, req.body.gender, req.body.jobrole, req.body.department, req.body.address];

    client.query(text, values)
        .then((result) => {
            const token = jwt.sign({
                userId: req.body.userid,
                firstName: req.body.firstname,
                admin: req.body.admin || false,
            },
            process.env.SECRET_KEY, { expiresIn: 7200 });
            res.status(201).json({
                status: 'success',
                data: {
                    message: 'User account successfully created',
                    token,
                    userId: result.rows[0].userid,
                },
            });
        })
        .catch((err) => res.status(500).json({ status: 'error', err }));
});

module.exports = router;
