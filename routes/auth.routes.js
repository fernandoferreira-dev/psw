const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/auth.controller");
const authController = new AuthController();


router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

module.exports = router;
