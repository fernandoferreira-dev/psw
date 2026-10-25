CREATE DATABASE IF NOT EXISTS psw;
USE psw;

CREATE TABLE user (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    user_email VARCHAR(255) NOT NULL UNIQUE,
    user_password VARCHAR(255) NOT NULL,
    user_nome VARCHAR(30) NOT NULL,
    user_sobrenome VARCHAR(30) NOT NULL,
    login_count INT NOT NULL DEFAULT 0,
    fav_artist INT NULL,
    fav_album INT NULL
);

CREATE TABLE discos (
    disco_id INT PRIMARY KEY AUTO_INCREMENT,
    disco_nome VARCHAR(255) NOT NULL
);

CREATE TABLE artistas (
    artista_id INT PRIMARY KEY AUTO_INCREMENT,
    artista VARCHAR(255) NOT NULL
);

CREATE TABLE musicas (
    musica_id INT PRIMARY KEY AUTO_INCREMENT,
    musica_nome VARCHAR(255) NOT NULL,
    disco_id INT,
    FOREIGN KEY (disco_id) REFERENCES discos(disco_id)
);

CREATE TABLE discos_artistas (
    discos_artistas_id INT PRIMARY KEY AUTO_INCREMENT,
    disco_id INT NOT NULL,
    artista_id INT NOT NULL,
    FOREIGN KEY (disco_id) REFERENCES discos(disco_id),
    FOREIGN KEY (artista_id) REFERENCES artistas(artista_id)
);