const bcrypt = require("bcrypt");

exports.hashPassword = (password) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(12, (err, salt) => {
            if (err) {
                reject(err); // Reject the promise if an error occurs
            }
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) {
                    reject(err); // Reject the promise if an error occurs
                }
                resolve(hash);
            });
        });
    });
};

exports.comparePassword = (password, hashed) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hashed, (err, result) => {
            if (err) {
                reject(err); // Reject the promise if an error occurs
            }
            resolve(result);
        });
    });
};
