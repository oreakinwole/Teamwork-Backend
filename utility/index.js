const isMyObjectEmpty = (myObject) => myObject && !Object.keys(myObject).length;

const getRandomString = (length) => {
    const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i += 1) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
};

module.exports = { isMyObjectEmpty, getRandomString };
