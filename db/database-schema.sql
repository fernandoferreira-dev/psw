CREATE DATABASE IF NOT EXISTS psw;
USE psw;

CREATE TABLE musicas (
    musica_id INT PRIMARY KEY AUTO_INCREMENT,
    musica_nome VARCHAR(255) NOT NULL,
    musica_artista VARCHAR(255) NOT NULL,
    musica_album VARCHAR(255) NOT NULL DEFAULT 'Single',
    musica_data_lancamento DATE NOT NULL,
    user_id INT
);

CREATE TABLE user (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    user_email VARCHAR(255) NOT NULL UNIQUE,
    user_password VARCHAR(255) NOT NULL,
    user_nome VARCHAR(30) NOT NULL,
    user_sobrenome VARCHAR(30) NOT NULL,
    login_count INT NOT NULL DEFAULT 0,
    user_fav_musica INT DEFAULT NULL,
    FOREIGN KEY (user_fav_musica) REFERENCES musicas(musica_id) ON DELETE SET NULL
);

ALTER TABLE musicas 
ADD CONSTRAINT fk_musicas_user 
FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE;
