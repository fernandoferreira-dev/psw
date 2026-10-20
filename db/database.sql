USE discos;

INSERT INTO user (user_email, user_password, user_nome, user_sobrenome) VALUES
('maria.silva@email.com', 'password123', 'Maria', 'Silva'),
('joao.santos@email.com', 'segredo456', 'João', 'Santos');

INSERT INTO artistas (artista) VALUES 
('Pink Floyd'),
('Iron Maiden'),
('System of a Down'),
('Korn');

INSERT INTO discos (disco_nome) VALUES 
('The Dark Side of the Moon'),
('The Number of the Beast'),
('Toxicity'),
('Follow the Leader');

INSERT INTO discos_artistas (disco_id, artista_id) VALUES 
(1, 1),
(2, 2),
(3, 3),
(4, 4);

INSERT INTO musicas (musica_nome, disco_id) VALUES 
('Time', 1),
('Money', 1),
('Run to the Hills', 2),
('Hallowed Be Thy Name', 2),
('Chop Suey!', 3),
('Toxicity', 3),
('Freak on a Leash', 4),
('Got the Life', 4),
-- Singles
('Arnold Layne', NULL),
('Women in Uniform', NULL),
('Shame', NULL),
('I Can Remember', NULL);