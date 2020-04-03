const request = require('supertest');
const { expect } = require('chai');
const app = require('../index');

/* Auth route */
describe('Auth route', () => {
    describe('POST /api/v1/auth/signin', () => {
        it('should return 400 if email does not exist', async () => {
            const email = 'hal@gmail.com';
            const password = 'boshenlo';

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
            const password = 'boshenlo';

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
            const password = 'teamworkAdmin';

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
            const lastname = 'Aiyedogbon';
            const email = 'segunaiye@ymail.com';
            const password = 'segfbdfbg3';
            const gender = 'Male';
            const jobrole = 'gbe bodyer';
            const department = 'dance';
            const address = 'Sango Ota';

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
            let password = 'teamworkAdmin';

            let res = await request(app)
                .post('/api/v1/auth/signin')
                .send({
                    email,
                    password,
                });
            const { token } = res.body.data;

            // create new user properties and value
            const firstname = 'Segun';
            const lastname = 'Aiyedogbon';
            email = 'segunaiye@yahoo.com';
            password = 'segun123';
            const gender = 'Male';
            const jobrole = 'gbe bodyer';
            const department = 'dance';
            const address = 'Sango Ota';

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
            // Signin with admin account in order to get a token to create user
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
            email = 'gbolahanani@yahoo.com';
            password = 'gbolylomo';
            const gender = 'Male';
            const jobrole = 'Shaku shaku dancer';
            const department = 'dance';
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


describe('Gifs route', () => {
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
                .attach('image', 'test/imgupload/gbeng_bth.gif')
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
});
