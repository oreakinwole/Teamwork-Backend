const { Client } = require('pg');

const bcrypt = require('bcrypt');

module.exports = async () => {
    const client = new Client();
    await client.connect();
    try {
        // Check if theres a users table present
        const query = 'SELECT  EXISTS (SELECT * FROM information_schema.tables WHERE table_name = $1)';
        const queryValue = ['users'];
        const usersDb = await client.query(query, queryValue);

        // hash the admin password in our env variable, to be used for the admin user in our DB
        const salt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash(process.env.ADMINPASSWORD, salt);

        // Create a Users table if non exists
        if (usersDb.rows[0].exists === false) {
            const createUserTable = 'CREATE TABLE Users(userid SMALLSERIAL PRIMARY KEY, firstname varchar (50) not null, lastname varchar (50) not null, email varchar (50) UNIQUE not null, password text not null, gender varchar (50) not null, jobrole varchar (50) not null, department varchar (50) not null, address text not null, admin boolean not null default false)';
            client.query(createUserTable)
                .then(() => console.log('Done Creating User Table'))
                .catch(() => console.log('Something failed while Creating user table'));

            // insert Admin User
            const text = 'INSERT INTO users(firstname, lastname, email, password, gender, jobrole, department, address, admin) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)';
            const values = ['Ore', 'Akinwole', 'oreakinwole@gmail.com', adminPassword, 'male', 'backend', 'software', '14, Sobo arobiodu street, G.R.A, Ikeja', true];
            client.query(text, values)
                .then(() => console.log('done inserting admin user'))
                .catch(() => console.log('something failed with inserting admin user'));

            const createArticleTable = 'CREATE TABLE Articles(articleid SMALLSERIAL PRIMARY KEY, title varchar (50) not null, article text not null, comments json[], createdon timestamp not null default current_date)';
            client.query(createArticleTable)
                .then(() => console.log('Done Creating Article Table'))
                .catch(() => console.log('Something failed while Creating article table'));

            const createGifTable = 'CREATE TABLE Gifs(gifid SMALLSERIAL PRIMARY KEY, title varchar (50) not null, imageurl text not null, comments json[], createdon timestamp not null default current_date)';
            client.query(createGifTable)
                .then(() => console.log('Done Creating Gif Table'))
                .catch(() => console.log('Something failed while Creating gif table'));
        } else {
            const adminUser = await client.query('SELECT * FROM users where admin = true');
            if (adminUser.rowCount === 0) {
                // insert Admin User
                const text = 'INSERT INTO users(firstname, lastname, email, password, gender, jobrole, department, address, admin) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)';
                const values = ['Ore', 'Akinwole', 'toyosi@gmail.com', adminPassword, 'male', 'backend', 'software', '14, Sobo arobiodu street, G.R.A, Ikeja', true];
                client.query(text, values)
                    .then(() => console.log('done inserting admin user after none was found'))
                    .catch((err) => console.log('Error inserting admin user after none was found', err));
            }
            await client.end();
        }
    } catch (error) {
        console.log('Something failed while checking if Table exists');
    }
};
