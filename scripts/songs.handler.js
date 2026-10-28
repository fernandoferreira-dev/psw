"use strict";

const mysql = require("mysql2/promise");
const options = require("./options.json");
const database = mysql.createPool(options.database);


function getAllSongs(req, res) {
    let sql = mysql.format("SELECT musica_nome, musica_artista, musica_album, musica_data_lancamento from musicas")

    database.querry(sql, function (err, rows) {
        if (err) {
            res.json(errorMessage);
        } else {
            res.json(rows)
        }
    })
}

function getSong(req, res) {

}

function updateSong(req, res) {
    /**
     * @todo atualizar toda a informação de um user
     */
}

function patchSong(req, res) {
    /**
     * @todo atualizar uma peça de informação de um user
     */
}

function deleteSong(req, res) {

}


module.exports = { getAllSongs, getSong, updateSong, patchSong, deleteSong };
