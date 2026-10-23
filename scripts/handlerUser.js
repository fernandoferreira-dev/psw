"use strict";

const mysql = require("mysql2");
const options = require("./options.json");


const login = (req, res) => {
    let connection = mysql.createConnection(options);

    connection.connect();

    let sql = "SELECT WHRE user_id = " + req.body.userId + "AND user_password = " + req.body.password + ";";
    connection.query(sql, function (err) {
        if (err) {
            res.json({ "Message": "401" });
        } else {
            res.json({
                "Message": "200",
            });
        }
    });

    connection.end();
}
module.exports.login = login;

const register = (req, res) => {
    let userData = req.body.user_email + "," + req.body.password + "," + req.body.name + "," + req.body.surname;

    let connection = mysql.createConnection(options);

    connection.connect();


    let sql = "INSERT INTO user(user_email, user_password, user_nome, user_sobrenome) VALUES(" + userData + ");"
    connection.query(sql, function (err) {
        if (err) {
            res.json({ "Message": "401" });
        } else {
            res.json({
                "Message": "200",
            });
        }
    });

    connection.end();
}
module.exports.register = register;

const deleteUser = (req, res) => {
    let connection = mysql.createConnection(options);

    connection.connect();


    let sql = "DELETE WHERE user_email = " + req.body.user_email
    connection.query(sql, function (err) {
        if (err) {
            res.json({ "Message": "404" });
        } else {
            res.json({
                "Message": "200",
            });
        }
    });

    connection.end();
}
module.exports.deleteUser = deleteUser;