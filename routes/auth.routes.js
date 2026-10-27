const express = require("express");

const authHandler = require("../scripts/auth.handler")
const router = express.Router();

router.post("/auth/register", authHandler.register);
router.post("/auth/login", authHandler.login);
router.post("/auth/logout", authHandler.logout);

module.exports = router;
