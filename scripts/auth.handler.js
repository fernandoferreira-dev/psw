"use strict";

const mysql = require("mysql2/promise");
const options = require("./options.json");
const database = mysql.createPool(options);


async function register(req, res) {
    const { email, password, firstName, lastName } = req.body ?? {};

    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: "É necessário preencher todos os dados." })
    }

    const cleanEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return res.status(400).json({ error: "Endereço de email inválido. " })
    }

    if (typeof password !== "string" || password.length === 0 || password.length > 128) {
        return res.status(400).json({ error: "Credenciais inválidas." });
    }

    const cleanFirstName = firstName.trim(), cleanLastName = lastName.trim()
    if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(cleanFirstName || cleanLastName)) {
        return { valid: false, error: "O nome contém caracteres inválidos." };
    }

    try {
        const [users] = await database.execute("SELECT user_id, password FROM users WHERE user_email = ?", [cleanEmail]);

        if (!users.length === 0) {
            return res.status(401).json({ error: "Utilizador já existente." });
        }

        database.execute(`
                INSERT INTO user (user_email, user_password, user_nome, user_sobrenome) 
                VALUES (user_email, user_password, user_nome, user_sobrenome),
            `, [cleanEmail, password, cleanFirstName, cleanLastName]);

        req.session.userId = user.id;
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

    const cleanEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return res.status(400).json({ error: "Endereço de email inválido. " })
    }

    if (typeof password !== "string" || password.length === 0 || password.length > 128) {
        return res.status(400).json({ error: "Credenciais inválidas." });
    }

    try {
        const [users] = await database.execute("SELECT user_id, password FROM users WHERE user_email = ?", [cleanEmail]);

        if (users.length === 0) {
            return res.status(401).json({ error: "Credenciais inválidas." });
        }

        const user = users[0];

        if (password !== user.password) {
            return res.status(401).json({ error: "Credenciais inválidas." });
        }

        req.session.userId = user.id;
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

        return res.status(200).json({ message: "Loutout efetuado com sucesso." });
    });
}


module.exports = { register, login, logout };
