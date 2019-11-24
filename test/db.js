const { Client } = require('pg');

module.exports = async (text, params) => {
    const client = new Client();
    await client.connect();

    return new Promise((resolve, reject) => {
        client.query(text, params)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            });
    });
};
