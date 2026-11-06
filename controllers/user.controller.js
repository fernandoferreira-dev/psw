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

async function getUserRanking(req, res) {
    try {
        const [ranking] = await database.execute(
            `SELECT u.user_id, u.user_nome, u.user_sobrenome, COUNT(m.musica_id) AS music_count
             FROM user u
             LEFT JOIN musicas m ON m.user_id = u.user_id
             GROUP BY u.user_id, u.user_nome, u.user_sobrenome
             ORDER BY music_count DESC, u.user_nome ASC
             LIMIT 10`
        );

        return res.status(200).json(ranking);
    } catch (error) {
        console.error("Erro ao obter ranking de utilizadores:", error);
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
            `SELECT u.user_id, u.user_email, u.user_nome, u.user_sobrenome, u.login_count,
                    u.user_fav_musica, m.musica_nome AS favorite_song_name,
                    m.musica_artista AS favorite_song_artist
             FROM user u
             LEFT JOIN musicas m ON m.musica_id = u.user_fav_musica
             WHERE u.user_id = ?`,
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

async function getPublicProfile(req, res) {
    const userId = Number(req.params.id);

    if (!userId || Number.isNaN(userId)) {
        return res.status(400).json({ error: "Identificador de utilizador inválido." });
    }

    try {
        const [users] = await database.execute(
            `SELECT u.user_id, u.user_nome, u.user_sobrenome, u.user_fav_musica,
                    f.musica_nome AS favorite_song_name, f.musica_artista AS favorite_song_artist,
                    COUNT(m.musica_id) AS music_count
             FROM user u
             LEFT JOIN musicas m ON m.user_id = u.user_id
             LEFT JOIN musicas f ON f.musica_id = u.user_fav_musica
             WHERE u.user_id = ?
             GROUP BY u.user_id, u.user_nome, u.user_sobrenome, u.user_fav_musica,
                      f.musica_nome, f.musica_artista`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: "Utilizador não encontrado." });
        }

        return res.status(200).json(users[0]);
    } catch (error) {
        console.error("Erro ao obter perfil público:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}

async function setFavorite(req, res) {
    const userId = req.session?.userId;
    const discId = Number(req.body?.discId);

    if (!userId) {
        return res.status(401).json({ error: "Sessão não iniciada." });
    }

    if (!discId || Number.isNaN(discId)) {
        return res.status(400).json({ error: "Identificador de música inválido." });
    }

    try {
        const [discs] = await database.execute("SELECT musica_id FROM musicas WHERE musica_id = ?", [discId]);
        if (discs.length === 0) {
            return res.status(404).json({ error: "Música não encontrada." });
        }

        await database.execute("UPDATE user SET user_fav_musica = ? WHERE user_id = ?", [discId, userId]);
        return res.status(200).json({ message: "Música adicionada aos favoritos.", favoriteSongId: discId });
    } catch (error) {
        console.error("Erro ao guardar favorito:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}

async function clearFavorite(req, res) {
    const userId = req.session?.userId;

    if (!userId) {
        return res.status(401).json({ error: "Sessão não iniciada." });
    }

    try {
        await database.execute("UPDATE user SET user_fav_musica = NULL WHERE user_id = ?", [userId]);
        return res.status(200).json({ message: "Favorito removido." });
    } catch (error) {
        console.error("Erro ao remover favorito:", error);
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

module.exports = { getAllUsers, getUserRanking, getProfile, getPublicProfile, setFavorite, clearFavorite, updateProfile, patchProfile, deleteProfile };
