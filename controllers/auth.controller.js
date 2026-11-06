"use strict";

const mysql = require("mysql2/promise");
const options = require("../config/app.config.json");
const database = mysql.createPool(options.database);
const emailRegEx = new RegExp(options.RegEx.email);
const nameRegEx = new RegExp(options.RegEx.names);
const bcrypt = require("bcrypt");

async function register(req, res) {
    const { email, password, firstName, lastName } = req.body ?? {};

    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: "É necessário preencher todos os dados." });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!emailRegEx.test(cleanEmail)) {
        return res.status(400).json({ error: "Endereço de email inválido." });
    }

    if (typeof password !== "string" || password.length === 0 || password.length > 128) {
        return res.status(400).json({ error: "Credenciais inválidas." });
    }

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();

    if (!nameRegEx.test(cleanFirstName) || !nameRegEx.test(cleanLastName)) {
        return res.status(400).json({ error: "O nome contém caracteres inválidos." });
    }

    try {
        const [existingUsers] = await database.execute(
            "SELECT user_id FROM user WHERE user_email = ?",
            [cleanEmail]
        );

        if (existingUsers.length > 0) {
            return res.status(401).json({ error: "Utilizador já existente." });
        }

        const hashPassword = await bcrypt.hash(password, 12);

        const [insertResult] = await database.execute(
            "INSERT INTO user (user_email, user_password, user_nome, user_sobrenome) VALUES (?, ?, ?, ?)",
            [cleanEmail, hashPassword, cleanFirstName, cleanLastName]
        );

        req.session.userId = insertResult.insertId;
        return res.status(200).json({ message: "Registo efetuado com sucesso." });

    } catch (error) {
        console.error("Erro no registo:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}

async function login(req, res) {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
        return res.status(400).json({ error: "Email e palavra-passe são obrigatórios." });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!emailRegEx.test(cleanEmail)) {
        return res.status(400).json({ error: "Endereço de email inválido." });
    }

    if (typeof password !== "string" || password.length === 0 || password.length > 128) {
        return res.status(400).json({ error: "Credenciais inválidas. 1" });
    }

    try {
        const [users] = await database.execute(
            "SELECT user_id, user_password FROM user WHERE user_email = ?",
            [cleanEmail]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: "Credenciais inválidas. 2" });
        }

        const activeUser = users[0];

        const isMatch = await bcrypt.compare(password, activeUser.user_password);

        if (!isMatch) {
            return res.status(401).json({ error: "Credenciais inválidas. 3" });
        }

        req.session.userId = activeUser.user_id;
        return res.status(200).json({ message: "Login efetuado com sucesso." });

    } catch (error) {
        console.error("Erro no login:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}

function logout(req, res) {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Erro ao encerrar a sessão." });
        }

        res.clearCookie("connect.sid");
        return res.status(200).json({ message: "Logout efetuado com sucesso." });
    });
}

module.exports = { register, login, logout };