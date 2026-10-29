const express = require("express");
const router = express.Router();


const userRoutes = require("./user.routes")
router.use("/users", userRoutes);

const songRoutes = require("./songs.routes")
router.use("/music", songRoutes);

const authRoutes = require("./auth.routes")
router.use("/auth", authRoutes);


module.exports = router;
