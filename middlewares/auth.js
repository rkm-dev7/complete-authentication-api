require("dotenv").config();
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if Authorization header is provided
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            status: "error",
            message: "Authentication failed. Bearer token not provided.",
        });
    }

    const token = authHeader.split(" ")[1];

    // Check if token is provided
    if (!token) {
        return res.status(401).json({
            status: "error",
            message: "Authentication failed. Token not provided.",
        });
    }

    jwt.verify(token, "process.env.SECRET_KEY", (err, decoded) => {
        if (err) {
            return res.status(403).json({
                status: "error",
                message: "Failed to authenticate token.",
            });
        }

        // If verification is successful, save the decoded token to the request object for future use
        req.user = decoded;
        next();
    });
};

module.exports = verifyToken;
