const express = require("express");
const router = express.Router();

const UserController = require("../controllers/user.controller");
const userController = new UserController();

router.get("/", userController.getAllUsers)

router
    .route("/me")
    .get(userController.getProfile)
    .put(userController.updateProfile)
    .patch(userController.patchProfile)
    .delete(userController.deleteProfile);


module.exports = router;
