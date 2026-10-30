const express = require("express");
const router = express.Router();


const userRoutes = require("./user.routes")
router.use("/users", userRoutes);

/* const musicRoutes = require("./music.routes")
router.use("/music", musicRoutes); */

const authRoutes = require("./auth.routes")
router.use("/auth", authRoutes);


module.exports = router;
