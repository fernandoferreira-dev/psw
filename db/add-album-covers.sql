USE psw;

ALTER TABLE musicas
ADD COLUMN musica_capa VARCHAR(500) DEFAULT NULL AFTER musica_data_lancamento;