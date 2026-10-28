const express = require("express")

const songHandler = require("../scripts/songs.handler")
const router = express.Router()


router.get("/", songHandler.getAllSongs)

router
    .route("/song")
    .get(songHandler.getSong)
    .put(songHandler.updateSong)
    .patch(songHandler.patchSong)
    .delete(songHandler.deleteSong);


module.exports = router
