const router = require("express").Router();
const UsersController = require("../controllers/usersController");
const verifyToken = require("../middlewares/auth");

router.post("/register", UsersController.userRegistration);
router.post("/login", verifyToken, UsersController.userLogin);
router.post("/reset-password", verifyToken, UsersController.resetPassword);
router.get("/logged-user", verifyToken, UsersController.loggedUser);
router.post(
    "/send-reset-password-email",
    UsersController.sendUserPasswordResetEmail
);
router.post("/reset-password/:id/:token", UsersController.userPasswordReset);

module.exports = router;
