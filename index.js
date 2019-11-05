/* eslint-disable no-console */
const express = require('express');
const auth1 = require('./authv1');

const app = express();

app.use(express.json());

// Api Routes
app.use('/api/v1/auth', auth1);
app.use('/api/auth', auth1);

// app port configuration
const port = process.env.PORT || 5000;
const server = app.listen(port, () => console.info(`Listening on port ${port}...`));
module.exports = server;
