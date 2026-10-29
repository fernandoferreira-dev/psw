const express = require("express")
const router = express.Router()

const SongsController = require("../controllers/songs.controller");
const songsController = new SongsController();

router.get("/", songsController.getAllSongs)
router.post("/", songsController.createSong);

router.get("/search", songsController.searchSongs);

router
    .route("/:id")
    .get(songsController.getSongById)
    .put(songsController.updateSong)
    .patch(songsController.patchSong)
    .delete(songsController.deleteSong);

module.exports = router
