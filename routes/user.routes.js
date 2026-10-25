const express = require("express")
const handlerUser = require("../scripts/user.handler");
const handlerDashboard = require("../scripts/handlerDashboard");
const router = express.Router();

router.post("/login", handlerUser.login)

router.post("/register", handlerUser.register)

router.get("/dashboard", handlerDashboard.getDashboard)

//router
//    .route("/:userId")
//    //.get(userHandlers.getUser)
//    //.put(userHandlers.updateUser)
//    .delete(userHandlers.deleteUser)

module.exports = router