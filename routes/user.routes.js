const express = require("express");

const router = express.Router();


const handlerUser = require("../scripts/user.handler");
const handlerDashboard = require("../scripts/handlerDashboard");

// Gestão da Própria Conta (Lê req.session.userId internamente)
//router
//    .route("/me")
//.get(handlerUser.getProfile)
//.put(handlerUser.updateProfile)
//.patch(handlerUser.patchProfile)
//.delete(handlerUser.deleteAccount);

// Favoritos do Utilizador Autenticado
router.patch("/me/favorites", handlerUser.setFavorite);

// Dashboard (Recurso isolado)
router.get("/dashboard", handlerDashboard.getDashboard);

module.exports = router;