var jwt = require("jsonwebtoken");
require("dotenv").config();

// Generates a JWT token
const generateToken = (user) => {
    const payload = {
        id: user._id,
    };

    const token = jwt.sign(payload, "process.env.SECRET_KEY", {
        expiresIn: "1h",
    });

    return token;
};

module.exports = generateToken;
