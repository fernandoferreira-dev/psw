const express = require("express");
const router = express.Router();

const { getAllUsers, getProfile, updateProfile, patchProfile, deleteProfile } = require("../controllers/user.controller");

router.get("/", getAllUsers)

router
    .route("/me")
    .get(getProfile)
    .put(updateProfile)
    .patch(patchProfile)
    .delete(deleteProfile);


module.exports = router;
