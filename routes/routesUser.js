const express = require("express")
const handlerUser = require("../scripts/handlerUser");

const router = express.Router()

router.post("/login", handlerUser.login)

router.get("/register", (req, res) => {
    res.send("register")
})

router
    .route("/:userId")
    .get(userHandlers.getUser)
    .put((req, res) => {
        res.send(`Update ${req.params.userId}`)
    })
    .delete((req, res) => {
        res.send(`Delete ${req.params.userId}`)
    })


module.exports = router