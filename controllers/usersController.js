const UserModel = require("../models/usersModel");
const { hashPassword, comparePassword } = require("../helpers/bcrypt");
const generateToken = require("../helpers/jwt");

class UsersController {
    static userRegistration = async (req, res) => {
        const { name, email, password, password_confirmation, tc } = req.body;
        try {
            // Input validation
            if (!name || !email || !password || !password_confirmation || !tc) {
                return res.status(400).json({
                    status: "error",
                    message: "Please provide all required fields.",
                });
            }

            //Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    status: "error",
                    message: "Please provide a valid email address.",
                });
            }

            // Password match check
            if (password !== password_confirmation) {
                return res.status(400).json({
                    status: "error",
                    message: "Passwords do not match.",
                });
            }

            // Check if email is taken
            const existingUser = await UserModel.findOne({ email: email });
            if (existingUser) {
                return res.status(400).json({
                    status: "error",
                    message: "Email already exists.",
                });
            }

            // Hash the password
            const hashedPassword = await hashPassword(password);

            // Create a new user
            const newUser = new UserModel({
                name: name,
                email: email,
                password: hashedPassword,
                tc: tc,
            });
            await newUser.save();
            console.log(newUser);

            // Generate token
            const token = generateToken(newUser);

            // Successful registration response
            res.status(200).json({
                status: "success",
                data: newUser,
                token: token,
            });
        } catch (error) {
            console.error(error);
            let errorMessage = "An error occurred during signup.";

            if (error.code === 11000) {
                errorMessage = "Username or email already exists.";
            } else if (error.name === "ValidationError") {
                errorMessage = Object.values(error.errors).map(
                    (error) => error.message
                );
            }

            // Error response
            res.status(401).json({
                status: "error",
                message: errorMessage,
            });
        }
    };

    static userLogin = async (req, res) => {
        try {
            const { email, password } = req.body;

            // Input validation
            if (!email || !password) {
                return res.status(400).json({
                    status: "error",
                    message: "Please provide all required fields.",
                });
            }

            // Find user by email
            const existingUser = await UserModel.findOne({ email: email });
            if (!existingUser) {
                return res.status(401).json({
                    status: "error",
                    message: "Invalid username or password",
                });
            }

            // Compare passwords
            const isMatch = await comparePassword(
                password,
                existingUser.password
            );
            if (!isMatch) {
                return res.status(401).json({
                    status: "error",
                    message: "Invalid username or password",
                });
            }

            // Generate token
            const token = generateToken(existingUser);

            // Successful login response
            res.status(200).json({
                status: "success",
                data: {
                    name: existingUser.name,
                    email: existingUser.email,
                },
                token: token,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: "error",
                message: "An error occurred during login.",
            });
        }
    };

    static resetPassword = async (req, res) => {
        try {
            const { name, password, password_confirmation } = req.body;

            // Input validation
            if (!name || !password || !password_confirmation) {
                return res.status(400).json({
                    status: "error",
                    message: "Please provide all required fields.",
                });
            }

            // Retrieve user by id
            const decodedUser = req.user;

            const existingUser = await UserModel.findById(decodedUser.id);
            console.log(existingUser);
            if (!existingUser) {
                return res.status(404).json({
                    status: "error",
                    message: "User not found.",
                });
            }

            if (password !== password_confirmation) {
                return res.status(400).json({
                    status: "error",
                    message: "Passwords do not match.",
                });
            }

            // Update password and reset token
            existingUser.password = await hashPassword(password);
            existingUser.name = name;
            await existingUser.save();

            res.status(200).json({
                status: "success",
                message: "Password reset successful.",
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: "error",
                message: "An error occurred while resetting the password.",
            });
        }
    };
}
module.exports = UsersController;
