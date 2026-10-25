"use strict";

const mysql = require("mysql2/promise");
const options = require("./options.json");
// Reutilizar as mesmas conexões ao inves de tar sempre a começar outra
const connection = mysql.createPool(options);

const getDashboard = async (req, res) => {
    try {
        const [[albumCount]] = await connection.query(
            "SELECT COUNT(*) AS count FROM discos",
        );
        const [[artistCount]] = await connection.query(
            "SELECT COUNT(*) AS count FROM artistas",
        );
        const [[trackCount]] = await connection.query(
            "SELECT COUNT(*) AS count FROM musicas",
        );
        const [ranking] = await connection.query(
            "SELECT user_nome AS name, user_sobrenome AS surname, login_count AS loginCount FROM `user` ORDER BY login_count DESC, user_id ASC LIMIT 10",
        );

        return res.json({
            stats: {
                albums: albumCount.count,
                artists: artistCount.count,
                tracks: trackCount.count,
            },
            ranking,
        });
    } catch (error) {
        console.error("Dashboard request failed:", error);
        return res.status(500).json({ message: "Não foi possível carregar o dashboard." });
    }
};
module.exports.getDashboard = getDashboard;
