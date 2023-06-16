const router = require("express").Router();
const UsersController = require("../controllers/usersController");
const verifyToken = require("../middlewares/auth");

router.post("/register", UsersController.userRegistration);
router.post("/login", verifyToken, UsersController.userLogin);
router.get("/reset-password", verifyToken, UsersController.resetPassword);

module.exports = router;
