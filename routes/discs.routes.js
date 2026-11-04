const express = require("express")
const router = express.Router()

const { getAllDiscs, createDisc, searchDiscs, getDiscById, updateDisc, patchDisc, deleteDisc } = require("../controllers/discs.controller");

router.get("/", getAllDiscs)
router.post("/", createDisc);

router.get("/search", searchDiscs);

router
    .route("/:id")
    .get(getDiscById)
    .put(updateDisc)
    .patch(patchDisc)
    .delete(deleteDisc);

module.exports = router
