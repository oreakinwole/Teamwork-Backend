/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');

const router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();

const users = [{
    firstName: 'Ore',
    lastName: 'Akinwole',
    email: 'oreakinwole@gmail.com',
    password: 'smart',
    gender: 'male',
    jobRole: 'backend developer',
    department: 'software',
    address: '14 sobo arobiodu',
    admin: true,
    userId: 1,
},
{
    firstName: 'Toyosi',
    lastName: 'Shode',
    email: 'toyosi@gmail.com',
    password: 'toyosi',
    gender: 'male',
    jobRole: 'frontend developer',
    department: 'software',
    address: '15 Fagba road',
    admin: false,
    userId: 2,
},

];
let lastId = 2;

class User {
    constructor(firstName, lastName, email, password, gender, jobRole, department, address, admin,
        userId) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.gender = gender;
        this.jobRole = jobRole;
        this.department = department;
        this.address = address;
        this.admin = admin;
        this.userId = userId;
    }

    generateUserAuthToken() {
        const token = jwt.sign({
            firstName: this.firstName,
            admin: this.admin,
            userId: this.userId,
        },
        // SECRET KEY can be gotten from the .env file where it is stored
        process.env.SECRET_KEY,
        { expiresIn: 240 });
        return token;
    }
}

// Create New User Route
router.post('/create-user', (req, res) => {
    const newUser = new User(req.body.firstName, req.body.lastName, req.body.email,
        req.body.password, req.body.gender, req.body.jobRole, req.body.department,
        req.body.address, req.body.admin, lastId + 1);
    lastId += 1;
    users.push(newUser);

    const token = newUser.generateUserAuthToken();
    res.status(201).json({
        status: 'success',
        data: {
            message: 'User account successfully created',
            token,
            userId: newUser.userId,
            allusers: users,
        },
    });
});

// User Sign in Route
router.post('/signin', (req, res) => {
    const currentUser = users.find((user) => user.email === req.body.email);
    if (!currentUser) {
        res.status(401).json({
            status: 'user not found',
            data: {},
        });
    }
    const token = jwt.sign({
        firstName: currentUser.firstName,
        admin: currentUser.admin,
        userId: currentUser.userId,
    },
    process.env.SECRET_KEY, { expiresIn: 240 });
    res.status(200).json({
        status: 'success',
        data: {
            token,
            userId: currentUser.userId,
            allusers: users,
        },
    });
});

module.exports = router;
