"use strict";

const mysql = require("mysql2/promise");
const options = require("./options.json");
const database = mysql.createPool(options.database);


function getAllUsers(res) {
    let sql = mysql.format("SELECT user_email, user_password, user_nome, user_sobrenome, login_count, user_fav_musica from users")

    database.query(sql, function (err, rows) {
        if (err) {
            res.json(errorMessage);
        } else {
            res.json(rows);
        }
    });
}

function getProfile(req, res) {
    const userId = req.session.userId;

    let sql = mysql.format("SELECT * FROM user WHERE user_id=?", [userId]);

    database.query(sql, function (err, rows) {
        if (err) {
            res.json(errorMessage);
        } else {
            res.json(rows);
        }
    });
}

function updateProfile(req, res) {
    const userId = req.session.userId;
    const { email, password, name, surname } = req.body;

    let sql = mysql.format(
        "UPDATE user SET user_email=?, user_password=?, user_nome=?, user_sobrenome=? WHERE user_id=?",
        [email, password, name, surname, userId],
    );

    database.query(sql, function (err, rows) {
        if (err) {
            res.json(errorMessage);
        } else {
            res.json(rows);
        }
    });
}

function patchProfile(req, res) {
    const userId = req.session.userId;
    const { field, value } = req.body;
    const userFields = [user_email, user_password, user_nome, user_sobrenome];

    if (!userFields.includes(field)) {
        return res.status(400).send("Campo invalido");
    }

    let sql = mysql.format(`UPDATE user SET ${field}=? WHERE user_id=?`, [
        value,
        userId,
    ]);

    database.query(sql, function (err, rows) {
        if (err) {
            res.json(errorMessage);
        } else {
            res.json(rows);
        }
    });
}

function deleteProfile(req, res) {
    const logout = require("./auth.handler.js");

    const userId = req.session.userId;

    let sql = mysql.format("DELETE * FROM user WHERE user_id=?", [userId]);

    database.query(sql, function (err, rows) {
        if (err) {
            res.json(errorMessage);
        } else {
            res.json({
                message:
                    "Conta apagada com sucesso. Processo de logout iniciado.",
            });
            logout();
        }
    });
}

module.exports = {
    getAllUsers,
    getProfile,
    updateProfile,
    patchProfile,
    deleteProfile,
};
