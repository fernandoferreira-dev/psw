const express = require("express");
const router = express.Router();

const { getAllUsers, getUserRanking, getProfile, getPublicProfile, setFavorite, clearFavorite, updateProfile, patchProfile, deleteProfile } = require("../controllers/users.controller");

router.get("/", getAllUsers)
router.get("/ranking", getUserRanking)
router.put("/me/favorite", setFavorite);
router.delete("/me/favorite", clearFavorite);

router
    .route("/me")
    .get(getProfile)
    .put(updateProfile)
    .patch(patchProfile)
    .delete(deleteProfile);

router.get("/:id", getPublicProfile);


module.exports = router;
