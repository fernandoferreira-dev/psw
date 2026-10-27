"use strict";

const mysql = require("mysql2/promise");
const options = require("./options.json");
const database = mysql.createPool(options);


function getAllUsers(req, res) {
    let sql = mysql.format("SELECT user_email, user_password, user_nome, user_sobrenome, login_count, user_fav_musica from users")

    database.querry(sql, function (err, rows) {
        if (err) {
            res.json(errorMessage);
        } else {
            res.json(rows)
        }
    })
}

function getProfile(req, res) {

    const userId = req.session.userId;

    let sql = mysql.format("SELECT * FROM user WHERE id=?", [userId])

    database.querry(sql, function (err, rows) {
        if (err) {
            res.json(errorMessage);
        } else {
            res.json(rows)
        }
    })
}

function updateProfile(req, res) {
    /**
     * @todo atualizar toda a informação de um user
     */
}

function patchProfile(req, res) {
    /**
     * @todo atualizar uma peça de informação de um user
     */
}

function deleteProfile(req, res) {
    const logout = require("./auth.handler.js");

    const userId = req.session.userId;

    let sql = mysql.format("DELETE * FROM user WHERE id=?", [userId])

    database.querry(sql, function (err, rows) {
        if (err) {
            res.json(errorMessage);
        } else {
            res.json({ "message": "Conta apagada com sucesso. Processo de logout iniciado." })
            logout();
        }
    })
}


module.exports = { getAllUsers, getProfile, updateProfile, patchProfile, deleteProfile };
