const request = require('supertest');
const { expect } = require('chai');
const { Client } = require('pg');
const app = require('../index');
const { getRandomString } = require('../utility/index');
const startDB = require('../startup/startdb');


const getRandomEmail = (length) => `${getRandomString(length).toLowerCase()}@gmail.com`;

before(async() => { await startDB() });

/* Auth route */
describe('Auth route', () => {
    describe('POST /api/v1/auth/signin', () => {
        it('should return 400 if email does not exist', async () => {
            const email = getRandomEmail(9);
            const password = 'randomPWord';

            const res = await request(app)
                .post('/api/v1/auth/signin')
                .send({
                    email,
                    password,
                });
            expect(res.status).to.equal(400);
        });

        it('should return 400 if password is wrong', async () => {
            const email = 'oreakinwole@gmail.com';
            const password = 'notAdminPWord';

            const res = await request(app)
                .post('/api/v1/auth/signin')
                .send({
                    email,
                    password,
                });
            expect(res.status).to.equal(400);
        });

        it('should return 200 if both email and password are valid', async () => {
            const email = 'oreakinwole@gmail.com';
            const password = process.env.ADMINPASSWORD;

            const res = await request(app)
                .post('/api/v1/auth/signin')
                .send({
                    email,
                    password,
                });
            expect(res.status).to.equal(200);
        });
    });

    describe('POST /api/v1/auth/create-user', () => {
        it('should return with a 400 error, for not providing a token', async () => {
            // create new user properties and value
            const firstname = 'Segun';
            const lastname = 'Electrician';
            const email = getRandomEmail(9);
            const password = 'randomPWord';
            const gender = 'Male';
            const jobrole = 'Electrician';
            const department = 'Power';
            const address = 'Idumota';

            // Send the request
            const res = await request(app)
                .post('/api/v1/auth/create-user')
                .send({
                    firstname,
                    lastname,
                    email,
                    password,
                    gender,
                    jobrole,
                    department,
                    address,
                });
            expect(res.status).to.equal(400);
        });

        it('should create a new user when admin token is provided', async () => {
            // Signin with admin account in order to get a token to create user
            let email = 'oreakinwole@gmail.com';
            let password = process.env.ADMINPASSWORD;

            let res = await request(app)
                .post('/api/v1/auth/signin')
                .send({
                    email,
                    password,
                });
            const { token } = res.body.data;

            // create new user properties and value
            const firstname = 'Segun';
            const lastname = 'Bouncer';
            email = 'segunaiye@yahoo.com';
            password = 'segun123';
            const gender = 'Male';
            const jobrole = 'Bouncer';
            const department = 'Security';
            const address = 'Allen Avenue';

            // Send the request
            res = await request(app)
                .post('/api/v1/auth/create-user')
                .set('teamworkToken', token)
                .send({
                    firstname,
                    lastname,
                    email,
                    password,
                    gender,
                    jobrole,
                    department,
                    address,
                });
            expect(res.status).to.equal(201);
        });

        it('should return with 403 error when token provided is not an admin token', async () => {
            // Signin with normal account in order to get a token which is not Admin token
            let email = 'segunaiye@yahoo.com';
            let password = 'segun123';

            let res = await request(app)
                .post('/api/v1/auth/signin')
                .send({
                    email,
                    password,
                });
            const { token } = res.body.data;

            // create new user properties and value
            const firstname = 'Gbolahan';
            const lastname = 'Aniyeloye';
            email = getRandomEmail(9);
            password = 'randomPWord';
            const gender = 'Male';
            const jobrole = 'Dancer';
            const department = 'Dance';
            const address = 'Ilupeju';

            // Send the request
            res = await request(app)
                .post('/api/v1/auth/create-user')
                .set('teamworkToken', token)
                .send({
                    firstname,
                    lastname,
                    email,
                    password,
                    gender,
                    jobrole,
                    department,
                    address,
                });
            expect(res.status).to.equal(403);
        });
    });
});

describe('Articles route', () => {
    describe('GET /api/v1/articles/feed/', () => {
        it('should return 200 status code', async () => {
            const email = 'segunaiye@yahoo.com';
            const password = 'segun123';

            const result = await request(app)
                .post('/api/v1/auth/signin')
                .send({
                    email,
                    password,
                });
            const { token } = result.body.data;

            const res = await request(app)
                .get('/api/v1/articles/feed')
                .set('teamworkToken', token);
            expect(res.status).to.equal(200);
        });
    });

    describe('POST /api/v1/articles', () => {
        it('should create a new article and return with 201 status code', async () => {
            const email = 'segunaiye@yahoo.com';
            const password = 'segun123';

            const result = await request(app)
                .post('/api/v1/auth/signin')
                .send({
                    email,
                    password,
                });
            const { token } = result.body.data;

            const newTitle = 'My test article';
            const newArticle = 'This is me testing my test article';
            const res = await request(app)
                .post('/api/v1/articles')
                .send({
                    title: newTitle,
                    article: newArticle,
                })
                .set('teamworkToken', token);
            expect(res.status).to.equal(201);
        });
    });

    describe('GET /api/v1/articles/:id', () => {
        it('should return 401 status code when invalid article id is given', async () => {
            const email = 'segunaiye@yahoo.com';
            const password = 'segun123';

            const result = await request(app)
                .post('/api/v1/auth/signin')
                .send({
                    email,
                    password,
                });
            const { token } = result.body.data;

            const invalidId = 500;
            const res = await request(app)
                .get(`/api/v1/articles/${invalidId}`)
                .set('teamworkToken', token);
            expect(res.status).to.equal(401);
        });

        it('should return 200 status code when valid article id is given', async () => {
            const email = 'segunaiye@yahoo.com';
            const password = 'segun123';

            const result = await request(app)
                .post('/api/v1/auth/signin')
                .send({
                    email,
                    password,
                });
            const { token } = result.body.data;

            const validId = 1;
            const res = await request(app)
                .get(`/api/v1/articles/${validId}`)
                .set('teamworkToken', token);
            expect(res.status).to.equal(200);
        });
    });

    describe('PUT /api/v1/articles/:id', () => {
        it('should return 401 status code when invalid article id is given', async () => {
            const email = 'segunaiye@yahoo.com';
            const password = 'segun123';

            const result = await request(app)
                .post('/api/v1/auth/signin')
                .send({
                    email,
                    password,
                });
            const { token } = result.body.data;

            const invalidId = 500;
            const newTitle = 'My changed test article';
            const newArticle = 'This is a change to my test article';
            const res = await request(app)
                .put(`/api/v1/articles/${invalidId}`)
                .send({
                    title: newTitle,
                    article: newArticle,
                })
                .set('teamworkToken', token);
            expect(res.status).to.equal(401);
        });

        it('should return 200 status code when valid article id is given', async () => {
            const email = 'segunaiye@yahoo.com';
            const password = 'segun123';

            const result = await request(app)
                .post('/api/v1/auth/signin')
                .send({
                    email,
                    password,
                });
            const { token } = result.body.data;

            const validId = 1;
            const newTitle = 'My changed test article';
            const newArticle = 'This is a change to my test article';
            const res = await request(app)
                .put(`/api/v1/articles/${validId}`)
                .send({
                    title: newTitle,
                    article: newArticle,
                })
                .set('teamworkToken', token);
            expect(res.status).to.equal(200);
        });
    });

    describe('POST /api/v1/articles/:id/comment', () => {
        it('should return 401 status code when invalid article id is given', async () => {
            const email = 'segunaiye@yahoo.com';
            const password = 'segun123';

            const result = await request(app)
                .post('/api/v1/auth/signin')
                .send({
                    email,
                    password,
                });
            const { token } = result.body.data;

            const invalidId = 500;
            const res = await request(app)
                .post(`/api/v1/articles/${invalidId}/comment`)
                .set('teamworkToken', token);
            expect(res.status).to.equal(401);
        });

        it('should return 201 status code when valid article id is given', async () => {
            const email = 'segunaiye@yahoo.com';
            const password = 'segun123';

            const result = await request(app)
                .post('/api/v1/auth/signin')
                .send({
                    email,
                    password,
                });
            const { token } = result.body.data;

            const validId = 1;
            const res = await request(app)
                .post(`/api/v1/articles/${validId}/comment`)
                .set('teamworkToken', token);
            expect(res.status).to.equal(201);
        });
    });

    describe('DELETE /api/v1/articles/:id', () => {
        it('should return 401 status code when invalid article id is given', async () => {
            const email = 'segunaiye@yahoo.com';
            const password = 'segun123';

            const result = await request(app)
                .post('/api/v1/auth/signin')
                .send({
                    email,
                    password,
                });
            const { token } = result.body.data;

            const invalidId = 500;
            const res = await request(app)
                .delete(`/api/v1/articles/${invalidId}`)
                .set('teamworkToken', token);
            expect(res.status).to.equal(401);
        });

        it('should return 200 status code when valid article id is given', async () => {
            const email = 'segunaiye@yahoo.com';
            const password = 'segun123';

            const result = await request(app)
                .post('/api/v1/auth/signin')
                .send({
                    email,
                    password,
                });
            const { token } = result.body.data;

            const validId = 1;
            const res = await request(app)
                .delete(`/api/v1/articles/${validId}`)
                .set('teamworkToken', token);
            expect(res.status).to.equal(200);
        });
    });
});


/* describe('Gifs route', () => {
    describe('GET /api/v1/gifs/feed/', () => {
        it('should return 200 status code', async () => {
            const email = 'segunaiye@yahoo.com';
            const password = 'segun123';

            const result = await request(app)
                .post('/api/v1/auth/signin')
                .send({
                    email,
                    password,
                });
            const { token } = result.body.data;

            const res = await request(app)
                .get('/api/v1/gifs/feed')
                .set('teamworkToken', token);
            expect(res.status).to.equal(200);
        });
    });

    describe('POST /api/v1/gifs', () => {
        // eslint-disable-next-line func-names
        it('should create a new gif and return with 201 status code', async function () {
            this.timeout(60000);

            const email = 'segunaiye@yahoo.com';
            const password = 'segun123';

            const result = await request(app)
                .post('/api/v1/auth/signin')
                .send({
                    email,
                    password,
                });
            const { token } = result.body.data;

            const newTitle = 'Testing img uploads';
            const res = await request(app)
                .post('/api/v1/gifs')
                .field('title', newTitle)
                .attach('image', 'test/imgupload/msanni.gif')
                .set('teamworkToken', token);
            expect(res.status).to.equal(201);
        });
    });

    describe('GET /api/v1/gifs/:id', () => {
        it('should return 401 status code when invalid gif id is given', async () => {
            const email = 'segunaiye@yahoo.com';
            const password = 'segun123';

            const result = await request(app)
                .post('/api/v1/auth/signin')
                .send({
                    email,
                    password,
                });
            const { token } = result.body.data;

            const invalidId = 500;
            const res = await request(app)
                .get(`/api/v1/gifs/${invalidId}`)
                .set('teamworkToken', token);
            expect(res.status).to.equal(401);
        });

        it('should return 200 status code when valid gif id is given', async () => {
            const email = 'segunaiye@yahoo.com';
            const password = 'segun123';

            const result = await request(app)
                .post('/api/v1/auth/signin')
                .send({
                    email,
                    password,
                });
            const { token } = result.body.data;

            const validId = 1;
            const res = await request(app)
                .get(`/api/v1/gifs/${validId}`)
                .set('teamworkToken', token);
            expect(res.status).to.equal(200);
        });
    });

    describe('POST /api/v1/gifs/:id/comment', () => {
        it('should return 401 status code when invalid gif id is given', async () => {
            const email = 'segunaiye@yahoo.com';
            const password = 'segun123';

            const result = await request(app)
                .post('/api/v1/auth/signin')
                .send({
                    email,
                    password,
                });
            const { token } = result.body.data;

            const invalidId = 500;
            const res = await request(app)
                .post(`/api/v1/gifs/${invalidId}/comment`)
                .set('teamworkToken', token);
            expect(res.status).to.equal(401);
        });

        it('should return 201 status code when valid gif id is given', async () => {
            const email = 'segunaiye@yahoo.com';
            const password = 'segun123';

            const result = await request(app)
                .post('/api/v1/auth/signin')
                .send({
                    email,
                    password,
                });
            const { token } = result.body.data;

            const validId = 1;
            const res = await request(app)
                .post(`/api/v1/gifs/${validId}/comment`)
                .set('teamworkToken', token);
            expect(res.status).to.equal(201);
        });
    });

    describe('DELETE /api/v1/gifs/:id', () => {
        it('should return 401 status code when invalid gif id is given', async () => {
            const email = 'segunaiye@yahoo.com';
            const password = 'segun123';

            const result = await request(app)
                .post('/api/v1/auth/signin')
                .send({
                    email,
                    password,
                });
            const { token } = result.body.data;

            const invalidId = 500;
            const res = await request(app)
                .delete(`/api/v1/gifs/${invalidId}`)
                .set('teamworkToken', token);
            expect(res.status).to.equal(401);
        });

        it('should return 200 status code when valid gif id is given', async () => {
            const email = 'segunaiye@yahoo.com';
            const password = 'segun123';

            const result = await request(app)
                .post('/api/v1/auth/signin')
                .send({
                    email,
                    password,
                });
            const { token } = result.body.data;

            const validId = 1;
            const res = await request(app)
                .delete(`/api/v1/gifs/${validId}`)
                .set('teamworkToken', token);
            expect(res.status).to.equal(200);
        });
    });
}); */

after(async() => {
    const client = new Client();
    await client.connect();

    client.query('drop table articles, gifs, users')
        .then(() => console.log('done post test tables delete'))
        .catch((err) => console.log('Error occured while doing post test tables delete', err));

});
