"use strict";

const mysql = require("mysql2/promise");
const options = require("../config/app.config.json");
const database = mysql.createPool(options.database);
const emailRegEx = new RegExp(options.RegEx.email);
const nameRegEx = new RegExp(options.RegEx.names);

async function getAllUsers(req, res) {
    try {
        const [user] = await database.execute(
            "SELECT user_id, user_email, user_nome, user_sobrenome, login_count, user_fav_musica FROM user"
        );

        return res.status(200).json(user);
    } catch (error) {
        console.error("Erro ao listar utilizadores:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}

async function getProfile(req, res) {
    const userId = req.session?.userId;

    if (!userId) {
        return res.status(401).json({ error: "Sessão não iniciada. Efetue login." });
    }

    try {
        const [user] = await database.execute(
            "SELECT user_id, user_email, user_nome, user_sobrenome, login_count, user_fav_musica FROM user WHERE user_id = ?",
            [userId]
        );

        if (user.length === 0) {
            return res.status(404).json({ error: "Utilizador não encontrado." });
        }

        return res.status(200).json(user[0]);
    } catch (error) {
        console.error("Erro ao obter perfil:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}

async function updateProfile(req, res) {
    const userId = req.session?.userId;
    const { email, password, firstName, lastName } = req.body ?? {};

    if (!userId) {
        return res.status(401).json({ error: "Sessão não iniciada." });
    }

    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: "Todos os campos (email, password, nome e sobrenome) são obrigatórios." });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!emailRegEx.test(cleanEmail)) {
        return res.status(400).json({ error: "Endereço de email inválido." });
    }

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    if (!nameRegEx.test(cleanFirstName) || !nameRegEx.test(cleanLastName)) {
        return res.status(400).json({ error: "O nome contém caracteres inválidos." });
    }

    try {
        const [result] = await database.execute(
            "UPDATE user SET user_email = ?, user_password = ?, user_nome = ?, user_sobrenome = ? WHERE user_id = ?",
            [cleanEmail, password, cleanFirstName, cleanLastName, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Utilizador não encontrado." });
        }

        return res.status(200).json({ message: "Perfil atualizado com sucesso." });
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}

async function patchProfile(req, res) {
    const userId = req.session?.userId;
    const { field, value } = req.body ?? {};

    if (!userId) {
        return res.status(401).json({ error: "Sessão não iniciada." });
    }

    const allowedFields = {
        email: "user_email",
        password: "user_password",
        firstName: "user_nome",
        lastName: "user_sobrenome",
        favoriteSong: "user_fav_musica"
    };

    const dbColumn = allowedFields[field];
    if (!dbColumn) {
        return res.status(400).json({ error: "Campo de atualização inválido." });
    }

    if (field === "email" && !emailRegEx.test(String(value).trim().toLowerCase())) {
        return res.status(400).json({ error: "Endereço de email inválido." });
    }

    try {
        const [result] = await database.execute(
            `UPDATE user SET ${dbColumn} = ? WHERE user_id = ?`,
            [value, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Utilizador não encontrado." });
        }

        return res.status(200).json({ message: "Campo do perfil atualizado com sucesso." });
    } catch (error) {
        console.error("Erro no patch do perfil:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}

async function deleteProfile(req, res) {
    const userId = req.session?.userId;

    if (!userId) {
        return res.status(401).json({ error: "Sessão não iniciada." });
    }

    try {
        const [result] = await database.execute(
            "DELETE FROM user WHERE user_id = ?",
            [userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Utilizador não encontrado." });
        }

        return new Promise((resolve) => {
            req.session.destroy((err) => {
                if (err) {
                    console.error("Erro ao apagar sessão pós-eliminação:", err);
                    resolve(res.status(500).json({ error: "Conta apagada, mas ocorreu um erro ao destruir a sessão." }));
                    return;
                }

                res.clearCookie("connect.sid");
                resolve(res.status(200).json({ message: "Conta eliminada e sessão encerrada com sucesso." }));
            });
        });

    } catch (error) {
        console.error("Erro ao apagar utilizador:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}

module.exports = { getAllUsers, getProfile, updateProfile, patchProfile, deleteProfile };
