"use strict";

const mysql = require("mysql2/promise");
const options = require("../config/app.config.json");
const database = mysql.createPool(options.database);

async function getAllDiscs(req, res) {
    try {
        const [discs] = await database.execute(
            "SELECT musica_id, musica_nome, musica_artista, musica_album, musica_data_lancamento, musica_capa FROM discs"
        );

        return res.status(200).json(discs);
    } catch (error) {
        console.error("Erro ao procurar músicas:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}

async function getRandomDiscs(req, res) {
    const requestedLimit = Number(req.query.limit) || 6;
    const limit = Math.min(Math.max(requestedLimit, 1), 12);

    try {
        const [discs] = await database.query(
            `SELECT m.musica_id, m.musica_nome, m.musica_artista, m.musica_album,
                    m.musica_data_lancamento, m.musica_capa, m.user_id, u.user_nome, u.user_sobrenome
             FROM discs m
             LEFT JOIN users u ON m.user_id = u.user_id
             ORDER BY RAND()
             LIMIT ${limit}`
        );

        return res.status(200).json(discs);
    } catch (error) {
        console.error("Erro ao procurar músicas aleatórias:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}

async function getMyDiscs(req, res) {
    const userId = req.session?.userId;

    if (!userId) {
        return res.status(401).json({ error: "Sessão não iniciada." });
    }

    try {
        const [discs] = await database.execute(
            `SELECT musica_id, musica_nome, musica_artista, musica_album, musica_data_lancamento, musica_capa
             FROM discs
             WHERE user_id = ?
             ORDER BY musica_nome ASC`,
            [userId]
        );

        return res.status(200).json(discs);
    } catch (error) {
        console.error("Erro ao procurar músicas do utilizador:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}

async function getDiscsByUser(req, res) {
    const userId = Number(req.params.id);

    if (!userId || Number.isNaN(userId)) {
        return res.status(400).json({ error: "Identificador de utilizador inválido." });
    }

    try {
        const [discs] = await database.execute(
            `SELECT musica_id, musica_nome, musica_artista, musica_album, musica_data_lancamento, musica_capa, user_id
             FROM discs
             WHERE user_id = ?
             ORDER BY musica_nome ASC`,
            [userId]
        );

        return res.status(200).json(discs);
    } catch (error) {
        console.error("Erro ao procurar músicas públicas do utilizador:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}

async function searchDiscs(req, res) {
    const { discName, user } = req.query;

    if (!discName && !user) {
        return res.status(400).json({ error: "Indica pelo menos um parâmetro de pesquisa ('discName' ou 'user')." });
    }

    try {
        let sql = `
                SELECT 
                    m.musica_id, 
                    m.musica_nome, 
                    m.musica_artista, 
                    m.musica_album, 
                    m.musica_data_lancamento,
                    m.musica_capa,
                    u.user_id,
                    u.user_nome,
                    u.user_sobrenome
                FROM discs m
                LEFT JOIN users u ON m.user_id = u.user_id
            `;

        const conditions = [];
        const queryParams = [];

        if (discName && discName.trim().length > 0) {
            conditions.push("m.musica_nome LIKE ?");
            queryParams.push(`%${discName.trim()}%`);
        }

        if (user && user.trim().length > 0) {
            const cleanUser = `%${user.trim()}%`;
            conditions.push("(u.user_nome LIKE ? OR u.user_sobrenome LIKE ? OR m.musica_artista LIKE ?)");
            queryParams.push(cleanUser, cleanUser, cleanUser);
        }

        if (conditions.length > 0) {
            sql += " WHERE " + conditions.join(" AND ");
        }

        const [discs] = await database.execute(sql, queryParams);

        return res.status(200).json(discs);
    } catch (error) {
        console.error("Erro na pesquisa de músicas:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}

async function getDiscById(req, res) {
    const discId = Number(req.params.id);

    if (!discId || isNaN(discId)) {
        return res.status(400).json({ error: "Identificador de música inválido." });
    }

    try {
        const [discs] = await database.execute(
            `SELECT m.musica_id, m.musica_nome, m.musica_artista, m.musica_album,
                    m.musica_data_lancamento, m.musica_capa, m.user_id, u.user_nome, u.user_sobrenome
             FROM discs m
             LEFT JOIN users u ON m.user_id = u.user_id
             WHERE m.musica_id = ?`,
            [discId]
        );

        if (discs.length === 0) {
            return res.status(404).json({ error: "Música não encontrada." });
        }

        return res.status(200).json(discs[0]);
    } catch (error) {
        console.error("Erro ao procurar música:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}

async function createDisc(req, res) {
    const { title, artist, album, releaseDate, cover } = req.body ?? {};

    if (!title || !artist) {
        return res.status(400).json({ error: "O título e o artista são obrigatórios." });
    }

    const cleanTitle = title.trim();
    const cleanArtist = artist.trim();
    const cleanAlbum = album ? album.trim() : null;

    try {
        const [insertResult] = await database.execute(
            "INSERT INTO discs (musica_nome, musica_artista, musica_album, musica_data_lancamento, musica_capa) VALUES (?, ?, ?, ?, ?)",
            [cleanTitle, cleanArtist, cleanAlbum, releaseDate || null, cover?.trim() || null]
        );

        return res.status(201).json({
            message: "Música adicionada com sucesso.",
            discId: insertResult.insertId
        });
    } catch (error) {
        console.error("Erro ao criar música:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}

async function createMyDisc(req, res) {
    const userId = req.session?.userId;
    const { title, artist, album, releaseDate, cover } = req.body ?? {};

    if (!userId) {
        return res.status(401).json({ error: "Sessão não iniciada." });
    }

    if (!title?.trim() || !artist?.trim() || !releaseDate) {
        return res.status(400).json({ error: "O título, artista e data de lançamento são obrigatórios." });
    }

    try {
        const [result] = await database.execute(
            `INSERT INTO discs
             (musica_nome, musica_artista, musica_album, musica_data_lancamento, musica_capa, user_id)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [title.trim(), artist.trim(), album?.trim() || "Single", releaseDate, cover?.trim() || null, userId]
        );

        return res.status(201).json({ message: "Música adicionada à tua coleção.", discId: result.insertId });
    } catch (error) {
        console.error("Erro ao adicionar música do utilizador:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}

async function updateDisc(req, res) {
    const discId = Number(req.params.id);
    const { title, artist, album, releaseDate, cover } = req.body ?? {};

    if (!discId || isNaN(discId)) {
        return res.status(400).json({ error: "Identificador de música inválido." });
    }

    if (!title || !artist) {
        return res.status(400).json({ error: "O título e o artista são de preenchimento obrigatório." });
    }

    try {
        const [result] = await database.execute(
            "UPDATE discs SET musica_nome = ?, musica_artista = ?, musica_album = ?, musica_data_lancamento = ?, musica_capa = ? WHERE musica_id = ?",
            [title.trim(), artist.trim(), album ? album.trim() : null, releaseDate || null, cover?.trim() || null, discId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Música não encontrada para atualização." });
        }

        return res.status(200).json({ message: "Música atualizada com sucesso." });
    } catch (error) {
        console.error("Erro ao atualizar música:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}

async function updateMyDisc(req, res) {
    const userId = req.session?.userId;
    const discId = Number(req.params.id);
    const { title, artist, album, releaseDate, cover } = req.body ?? {};

    if (!userId) {
        return res.status(401).json({ error: "Sessão não iniciada." });
    }

    if (!discId || Number.isNaN(discId)) {
        return res.status(400).json({ error: "Identificador de música inválido." });
    }

    if (!title?.trim() || !artist?.trim()) {
        return res.status(400).json({ error: "O título e o artista são obrigatórios." });
    }

    try {
        const [result] = await database.execute(
            `UPDATE discs
             SET musica_nome = ?, musica_artista = ?, musica_album = ?, musica_data_lancamento = ?, musica_capa = ?
             WHERE musica_id = ? AND user_id = ?`,
            [title.trim(), artist.trim(), album?.trim() || "Single", releaseDate || null, cover?.trim() || null, discId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Música não encontrada na tua coleção." });
        }

        return res.status(200).json({ message: "Música atualizada com sucesso." });
    } catch (error) {
        console.error("Erro ao atualizar música do utilizador:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}

async function deleteMyDisc(req, res) {
    const userId = req.session?.userId;
    const discId = Number(req.params.id);

    if (!userId) {
        return res.status(401).json({ error: "Sessão não iniciada." });
    }

    if (!discId || Number.isNaN(discId)) {
        return res.status(400).json({ error: "Identificador de música inválido." });
    }

    try {
        const [result] = await database.execute(
            "DELETE FROM discs WHERE musica_id = ? AND user_id = ?",
            [discId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Música não encontrada na tua coleção." });
        }

        return res.status(200).json({ message: "Música removida com sucesso." });
    } catch (error) {
        console.error("Erro ao remover música do utilizador:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}

async function patchDisc(req, res) {
    const discId = Number(req.params.id);
    const { field, value } = req.body ?? {};

    if (!discId || isNaN(discId)) {
        return res.status(400).json({ error: "Identificador de música inválido." });
    }

    const allowedFields = {
        title: "musica_nome",
        artist: "musica_artista",
        album: "musica_album",
        releaseDate: "musica_data_lancamento"
    };

    const dbColumn = allowedFields[field];
    if (!dbColumn) {
        return res.status(400).json({ error: "Campo de atualização inválido." });
    }

    try {
        const [result] = await database.execute(
            `UPDATE discs SET ${dbColumn} = ? WHERE musica_id = ?`,
            [value !== undefined ? value : null, discId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Música não encontrada." });
        }

        return res.status(200).json({ message: "Campo da música atualizado com sucesso." });
    } catch (error) {
        console.error("Erro ao efetuar patch da música:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}

async function deleteDisc(req, res) {
    const discId = Number(req.params.id);

    if (!discId || isNaN(discId)) {
        return res.status(400).json({ error: "Identificador de música inválido." });
    }

    try {
        const [result] = await database.execute(
            "DELETE FROM discs WHERE musica_id = ?",
            [discId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Música não encontrada para remoção." });
        }

        return res.status(200).json({ message: "Música removida com sucesso." });
    } catch (error) {
        console.error("Erro ao apagar música:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}

module.exports = { getAllDiscs, getRandomDiscs, getMyDiscs, getDiscsByUser, searchDiscs, getDiscById, createDisc, createMyDisc, updateDisc, updateMyDisc, patchDisc, deleteDisc, deleteMyDisc };
