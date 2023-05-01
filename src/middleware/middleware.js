const jwt = require("jsonwebtoken")

exports.verification = (token) => {
    return (req, res, next) => {
        try {
            const getToken = req.cookies[token];
            const verified = jwt.verify(getToken, process.env.JWT_SECRET)
            req.data = verified
            next()

        } catch (err) {
            return res.status(401).json({ msg: "Authorization denied" })
        }
    }
}


exports.userMiddleware = (req, res, next) => {
    if (req.data.role !== 'user') {
        return res.status(401).json({ msg: "Access denied" })
    }
    next()
}


exports.adminMiddleware = (req, res, next) => {
    if (req.data.role !== 'admin') {
        return res.status(401).json({ msg: "Access denied" })
    }
    next()
}