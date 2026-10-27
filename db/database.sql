INSERT INTO user (user_email, user_password, user_nome, user_sobrenome, login_count, user_fav_musica) 
VALUES 
    ('joao.silva@email.com', '1234', 'João', 'Silva', 5, 2),
    ('maria.santos@email.com', '1234', 'Maria', 'Santos', 12, 1),
    ('ana.costa@email.com', '1234', 'Ana', 'Costa', 2, NULL);

-- 5. Inserir as músicas associadas aos utilizadores
INSERT INTO musicas (musica_nome, musica_artista, musica_album, musica_data_lancamento, user_id) 
VALUES 
    -- Korn
    ('Freak on a Leash', 'Korn', 'Follow the Leader', '1998-08-18', 1),
    ('Blind', 'Korn', 'Korn', '1994-10-11', 1),
    
    -- Pink Floyd
    ('Comfortably Numb', 'Pink Floyd', 'The Wall', '1979-11-30', 1),
    ('Wish You Were Here', 'Pink Floyd', 'Wish You Were Here', '1975-09-12', 3),
    
    -- Metallica
    ('Master of Puppets', 'Metallica', 'Master of Puppets', '1986-03-03', 2),
    ('Enter Sandman', 'Metallica', 'Metallica', '1991-08-12', 2),
    
    -- Green Day
    ('Basket Case', 'Green Day', 'Dookie', '1994-02-01', 3),
    ('American Idiot', 'Green Day', 'American Idiot', '2004-09-21', 3);
