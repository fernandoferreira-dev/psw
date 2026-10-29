"use strict";

const mysql = require("mysql2/promise");
const options = require("../config/app.config.json");

class SongsController {
    constructor() {
        this.database = mysql.createPool(options.database);

        this.nameRegEx = new RegExp(options.RegEx.names);

        this.getAllSongs = this.getAllSongs.bind(this);
        this.searchSongs = this.searchSongs.bind(this);
        this.getSongById = this.getSongById.bind(this);
        this.createSong = this.createSong.bind(this);
        this.updateSong = this.updateSong.bind(this);
        this.patchSong = this.patchSong.bind(this);
        this.deleteSong = this.deleteSong.bind(this);
    }

    async getAllSongs(req, res) {
        try {
            const [songs] = await this.database.execute(
                "SELECT musica_id, musica_nome, musica_artista, musica_album, musica_data_lancamento FROM musicas"
            );

            return res.status(200).json(songs);
        } catch (error) {
            console.error("Erro ao procurar músicas:", error);
            return res.status(500).json({ error: "Erro interno do servidor." });
        }
    }

    async searchSongs(req, res) {
        const { songName, user } = req.query;

        if (!songName && !user) {
            return res.status(400).json({ error: "Indica pelo menos um parâmetro de pesquisa ('songName' ou 'user')." });
        }

        try {
            let sql = `
                SELECT 
                    m.musica_id, 
                    m.musica_nome, 
                    m.musica_artista, 
                    m.musica_album, 
                    m.musica_data_lancamento,
                    u.user_id,
                    u.user_nome,
                    u.user_sobrenome
                FROM musicas m
                LEFT JOIN users u ON m.user_id = u.user_id
            `;

            const conditions = [];
            const queryParams = [];

            if (songName && songName.trim().length > 0) {
                conditions.push("m.musica_nome LIKE ?");
                queryParams.push(`%${songName.trim()}%`);
            }

            if (user && user.trim().length > 0) {
                const cleanUser = `%${user.trim()}%`;
                conditions.push("(u.user_nome LIKE ? OR u.user_sobrenome LIKE ? OR m.musica_artista LIKE ?)");
                queryParams.push(cleanUser, cleanUser, cleanUser);
            }

            if (conditions.length > 0) {
                sql += " WHERE " + conditions.join(" AND ");
            }

            const [songs] = await this.database.execute(sql, queryParams);

            return res.status(200).json(songs);
        } catch (error) {
            console.error("Erro na pesquisa de músicas:", error);
            return res.status(500).json({ error: "Erro interno do servidor." });
        }
    }

    async getSongById(req, res) {
        const songId = Number(req.params.id);

        if (!songId || isNaN(songId)) {
            return res.status(400).json({ error: "Identificador de música inválido." });
        }

        try {
            const [songs] = await this.database.execute(
                "SELECT musica_id, musica_nome, musica_artista, musica_album, musica_data_lancamento FROM musicas WHERE musica_id = ?",
                [songId]
            );

            if (songs.length === 0) {
                return res.status(404).json({ error: "Música não encontrada." });
            }

            return res.status(200).json(songs[0]);
        } catch (error) {
            console.error("Erro ao procurar música:", error);
            return res.status(500).json({ error: "Erro interno do servidor." });
        }
    }

    async createSong(req, res) {
        const { title, artist, album, releaseDate } = req.body ?? {};

        if (!title || !artist) {
            return res.status(400).json({ error: "O título e o artista são obrigatórios." });
        }

        const cleanTitle = title.trim();
        const cleanArtist = artist.trim();
        const cleanAlbum = album ? album.trim() : null;

        try {
            const [insertResult] = await this.database.execute(
                "INSERT INTO musicas (musica_nome, musica_artista, musica_album, musica_data_lancamento) VALUES (?, ?, ?, ?)",
                [cleanTitle, cleanArtist, cleanAlbum, releaseDate || null]
            );

            return res.status(201).json({
                message: "Música adicionada com sucesso.",
                songId: insertResult.insertId
            });
        } catch (error) {
            console.error("Erro ao criar música:", error);
            return res.status(500).json({ error: "Erro interno do servidor." });
        }
    }

    async updateSong(req, res) {
        const songId = Number(req.params.id);
        const { title, artist, album, releaseDate } = req.body ?? {};

        if (!songId || isNaN(songId)) {
            return res.status(400).json({ error: "Identificador de música inválido." });
        }

        if (!title || !artist) {
            return res.status(400).json({ error: "O título e o artista são de preenchimento obrigatório." });
        }

        try {
            const [result] = await this.database.execute(
                "UPDATE musicas SET musica_nome = ?, musica_artista = ?, musica_album = ?, musica_data_lancamento = ? WHERE musica_id = ?",
                [title.trim(), artist.trim(), album ? album.trim() : null, releaseDate || null, songId]
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

    async patchSong(req, res) {
        const songId = Number(req.params.id);
        const { field, value } = req.body ?? {};

        if (!songId || isNaN(songId)) {
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
            const [result] = await this.database.execute(
                `UPDATE musicas SET ${dbColumn} = ? WHERE musica_id = ?`,
                [value !== undefined ? value : null, songId]
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

    async deleteSong(req, res) {
        const songId = Number(req.params.id);

        if (!songId || isNaN(songId)) {
            return res.status(400).json({ error: "Identificador de música inválido." });
        }

        try {
            const [result] = await this.database.execute(
                "DELETE FROM musicas WHERE musica_id = ?",
                [songId]
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
}

module.exports = SongsController;