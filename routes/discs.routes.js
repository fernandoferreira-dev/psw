const express = require("express")
const router = express.Router()

const { getAllDiscs, getRandomDiscs, getMyDiscs, getDiscsByUser, createDisc, createMyDisc, searchDiscs, getDiscById, updateDisc, updateMyDisc, patchDisc, deleteDisc, deleteMyDisc } = require("../controllers/discs.controller");

router.get("/", getAllDiscs)
router.get("/random", getRandomDiscs)
router.get("/mine", getMyDiscs)
router.get("/by-user/:id", getDiscsByUser)
router.post("/", createDisc);
router.post("/mine", createMyDisc);

router.get("/search", searchDiscs);

router
    .route("/:id")
    .get(getDiscById)
    .put(updateDisc)
    .patch(patchDisc)
    .delete(deleteDisc);

router.put("/mine/:id", updateMyDisc);
router.delete("/mine/:id", deleteMyDisc);

module.exports = router
