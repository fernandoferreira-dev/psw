"use strict";

const mysql = require("mysql2/promise");
const options = require("./options.json");
// Reutilizar as mesmas conexões ao inves de tar sempre a começar outra
const connection = mysql.createPool(options);

const getDashboard = async (req, res) => {
    try {
        const userId = req.session?.userId;
        let favoriteAlbum = null;
        let favoriteArtist = null;

        if (userId) {
            const [favorites] = await connection.execute(
                "SELECT fav_album AS album, fav_artist AS artist FROM `user` WHERE user_id = ?",
                [userId],
            );
            favoriteAlbum = favorites[0]?.album ?? null;
            favoriteArtist = favorites[0]?.artist ?? null;
        }

        const [
            [[albumCount]],
            [[artistCount]],
            [[trackCount]],
            [albums],
            [artists],
            [ranking],
        ] = await Promise.all([
            connection.query("SELECT COUNT(*) AS count FROM discos"),
            connection.query("SELECT COUNT(*) AS count FROM artistas"),
            connection.query("SELECT COUNT(*) AS count FROM musicas"),
            connection.query(
                "SELECT disco_id AS id, disco_nome AS name FROM discos ORDER BY CASE WHEN disco_id = ? THEN 0 ELSE 1 END, disco_nome ASC LIMIT 5",
                [favoriteAlbum],
            ),
            connection.query(
                "SELECT artista_id AS id, artista AS name FROM artistas ORDER BY CASE WHEN artista_id = ? THEN 0 ELSE 1 END, artista ASC LIMIT 5",
                [favoriteArtist],
            ),
            connection.query(
                "SELECT user_nome AS name, user_sobrenome AS surname, login_count AS loginCount FROM `user` ORDER BY login_count DESC, user_id ASC LIMIT 10",
            ),
        ]);

        return res.json({
            stats: {
                albums: albumCount.count,
                artists: artistCount.count,
                tracks: trackCount.count,
            },
            albums,
            artists,
            favorites: {
                album: favoriteAlbum,
                artist: favoriteArtist,
            },
            canFavorite: Boolean(userId),
            ranking,
        });
    } catch (error) {
        console.error("Dashboard request failed:", error);
        return res
            .status(500)
            .json({ message: "Não foi possível carregar o dashboard." });
    }
};
module.exports.getDashboard = getDashboard;
