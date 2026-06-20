const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, "mysecretkey");
        req.user = decoded;   // 👈 important
        next();
    } catch (err) {
        req.user = null;
        next();
    }
};