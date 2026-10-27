const express = require("express");

const userHandler = require("../scripts/user.handler.js");
const router = express.Router();

router.get("/", userHandler.getAllUsers)

router
    .route("/me")
    .get(userHandler.getProfile)
    .put(userHandler.updateProfile)
    .patch(userHandler.patchProfile)
    .delete(userHandler.deleteProfile);

module.exports = router;
