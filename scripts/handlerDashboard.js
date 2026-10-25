"use strict";

const mysql = require("mysql2/promise");
const options = require("./options.json");
// Reutilizar as mesmas conexões ao inves de tar sempre a começar outra
const connection = mysql.createPool(options);

const getDashboard = async (req, res) => {
    try {
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
                "SELECT disco_id AS id, disco_nome AS name FROM discos ORDER BY disco_nome ASC LIMIT 5",
            ),
            connection.query(
                "SELECT artista_id AS id, artista AS name FROM artistas ORDER BY artista ASC LIMIT 5",
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
