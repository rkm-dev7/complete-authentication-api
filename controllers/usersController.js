const UserModel = require("../models/usersModel");
const { hashPassword, comparePassword } = require("../helpers/bcrypt");
const generateToken = require("../helpers/jwt");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const transporter = require("../config/emailConfig");

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

    static loggedUser = async (req, res) => {
        try {
            // Fetch the logged-in user based on the ID from the request object
            const loggedUser = await UserModel.findById(req.user.id);

            // Check if the user exists
            if (!loggedUser) {
                req.status(404).json({
                    status: "error",
                    message: "User not found.",
                });
            }

            // If the user is found, send a 200 response with the user data
            res.status(200).json({
                status: "success",
                data: {
                    id: loggedUser._id,
                    name: loggedUser.name,
                    email: loggedUser.email,
                    tc: loggedUser.tc,
                },
            });
        } catch (error) {
            // If an error occurs during the execution of the code, handle it here
            console.error(error);
            // Send a 500 response with a generic error message
            res.status(500).json({
                success: false,
                error: "Internal server error",
            });
        }
    };

    // Other required imports

    static sendUserPasswordResetEmail = async (req, res) => {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    status: "error",
                    message: "Please provide an email.",
                });
            }

            // Find user by email
            const existingUser = await UserModel.findOne({ email });

            if (!existingUser) {
                return res.status(404).json({
                    status: "error",
                    message: "Email does not exist.",
                });
            }

            const secret = existingUser._id + process.env.SECRET_KEY;
            const token = jwt.sign({ userId: existingUser._id }, secret, {
                expiresIn: "15m",
            });

            // send mail with defined transport object
            let info = await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: existingUser.email,
                subject: "GeekShoop - Password Reset Link",
                html: `<a href=${resetLink}>Click here to reset your password</a>`,
            });

            res.status(200).json({
                status: "success",
                message: "Password reset email sent. Please check your email.",
            });
        } catch (error) {
            console.error("Error in sendUserPasswordResetEmail:", error);
            res.status(500).json({
                status: "error",
                message: "An internal server error occurred.",
            });
        }
    };

    static userPasswordReset = async (req, res) => {
        try {
            const { password, password_confirmation } = req.body;
            const { id, token } = req.params;

            // Validate password and password_confirmation
            if (!password || !password_confirmation) {
                return res.status(400).json({
                    error: "Please provide both password and password_confirmation.",
                });
            }

            if (password !== password_confirmation) {
                return res
                    .status(400)
                    .json({ error: "Passwords do not match." });
            }
            // Find the existing user
            const existingUser = await UserModel.findById(id);
            if (!existingUser) {
                return res.status(404).json({ error: "User not found." });
            }
            const new_secret = existingUser._id + process.env.SECRET_KEY;

            // Verify the token
            jwt.verify(token, new_secret);
            const hashedPassword = await bcrypt.hash(password, 10);

            // Update the user's password
            await UserModel.findByIdAndUpdate(id, {
                password: hashedPassword,
            });

            // Password reset successful
            return res
                .status(200)
                .json({ message: "Password reset successful." });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                error: "An error occurred while processing your request.",
            });
        }
    };
}
module.exports = UsersController;
