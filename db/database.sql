INSERT INTO users (user_email, user_password, user_nome, user_sobrenome, login_count, user_fav_musica)
VALUES 
    ('joao.silva@email.com', '1234', 'João', 'Silva', 5, NULL),
    ('maria.santos@email.com', '1234', 'Maria', 'Santos', 12, NULL),
    ('ana.costa@email.com', '1234', 'Ana', 'Costa', 2, NULL);

INSERT INTO discs (musica_nome, musica_artista, musica_album, musica_data_lancamento, musica_capa, user_id)
VALUES 
    ('Freak on a Leash', 'Korn', 'Follow the Leader', '1998-08-18', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJtgTAKX8OdISLmXkeu2M0bumxPp4Nz3jTNSLo15vcdQ&s=10', 1),
    ('Blind', 'Korn', 'Korn', '1994-10-11', 'https://upload.wikimedia.org/wikipedia/en/1/16/Korn-Korn.jpg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original', 1),
    
    ('Comfortably Numb', 'Pink Floyd', 'The Wall', '1979-11-30', 'https://i.scdn.co/image/ab67616d0000b273b694e89ba937dd2631ff584c', 1),
    ('Wish You Were Here', 'Pink Floyd', 'Wish You Were Here', '1975-09-12', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhkXq-YXiWkoCzNkI-gV9OZkOFa8uGZUaeCU6lkJkmJFFkj8JNKdcoehs&s=10', 3),
    
    ('Master of Puppets', 'Metallica', 'Master of Puppets', '1986-03-03', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThFwrNoEzyrZq_irzSSz0OtLU8vWm1KHXk-2W3KHKCrA&s=10', 2),
    ('Enter Sandman', 'Metallica', 'Metallica', '1991-08-12', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPa2SKa_rTzJONCLxInWaZGuS8K1UP3JVI9hq7HZMKmQ&s=10', 2),

    ('Basket Case', 'Green Day', 'Dookie', '1994-02-01', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpjrKhl77O9np8vDIUItHpO7-q36khoRbSqA0vWia4zg&s=10', 3),
    ('American Idiot', 'Green Day', 'American Idiot', '2004-09-21', 'https://upload.wikimedia.org/wikipedia/pt/3/32/AmericanIdiot.jpg?utm_source=pt.wikipedia.org&utm_campaign=index&utm_content=original', 3);

UPDATE users SET user_fav_musica = 2 WHERE user_id = 1;
UPDATE users SET user_fav_musica = 1 WHERE user_id = 2;
