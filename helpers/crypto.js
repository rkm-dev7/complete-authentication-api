const crypto = require("crypto");

// Generate a random secret key for JWT
const generateSecretKey = () => {
    const secretKey = crypto.randomBytes(32).toString("hex");
    return secretKey;
};

const secretKey = generateSecretKey();
console.log("Generated Secret Key:", secretKey);
