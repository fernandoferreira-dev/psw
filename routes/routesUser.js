const express = require("express")
const handlerUser = require("../scripts/handlerUser");

const router = express.Router()

router.post("/login", handlerUser.login)

router.post("/register", handlerUser.register)

router
    .route("/:userId")
    //.get(userHandlers.getUser)
    //.put(userHandlers.updateUser)
    .delete(userHandlers.deleteUser)

module.exports = router