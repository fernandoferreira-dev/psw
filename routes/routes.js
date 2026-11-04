const express = require("express");
const router = express.Router();


const userRoutes = require("./user.routes")
router.use("/users", userRoutes);

const discRoutes = require("./discs.routes")
router.use("/discs", discRoutes);

const authRoutes = require("./auth.routes")
router.use("/auth", authRoutes);


module.exports = router;
