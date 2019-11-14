// To check if user is an Admin User

module.exports = (req, res, next) => {
    if (!req.user.admin) {
        res.status(403).send('Access denied');
        return;
    }
    next();
};
