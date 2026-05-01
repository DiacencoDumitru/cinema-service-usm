INSERT INTO users (name, email, password_hash, role)
VALUES ('Administrator', 'admin@cineverse.local',
        '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'ADMIN');

INSERT INTO prices (category, format, amount)
VALUES ('STANDARD', 'TWO_D', 35.00),
       ('STANDARD', 'THREE_D', 45.00),
       ('VIP', 'TWO_D', 55.00),
       ('VIP', 'THREE_D', 70.00),
       ('CHILD', 'TWO_D', 25.00),
       ('CHILD', 'THREE_D', 32.00),
       ('STUDENT', 'TWO_D', 28.00),
       ('STUDENT', 'THREE_D', 36.00);

INSERT INTO halls (name, rows_count, seats_per_row)
VALUES ('Sala Premium 1', 8, 12),
       ('Sala VIP Arena', 10, 14),
       ('Sala Compact', 6, 10);

INSERT INTO seats (hall_id, row_num, col_num, seat_type)
SELECT 1, r, c, CASE WHEN r = 8 THEN 'VIP' ELSE 'STANDARD' END
FROM generate_series(1, 8) AS r,
     generate_series(1, 12) AS c;

INSERT INTO seats (hall_id, row_num, col_num, seat_type)
SELECT 2, r, c, CASE WHEN r >= 9 THEN 'VIP' ELSE 'STANDARD' END
FROM generate_series(1, 10) AS r,
     generate_series(1, 14) AS c;

INSERT INTO seats (hall_id, row_num, col_num, seat_type)
SELECT 3, r, c, CASE WHEN r = 6 THEN 'VIP' ELSE 'STANDARD' END
FROM generate_series(1, 6) AS r,
     generate_series(1, 10) AS c;

INSERT INTO movies (title, original_title, duration_min, genres, director, actors, age_rating, synopsis,
                    poster_url, trailer_url, status, release_date)
VALUES ('Bestia din mine', 'Beast Inside', 118,
        ARRAY ['Horror', 'Thriller'], 'Corneliu Porumboiu',
        ARRAY ['Ana Dumitru', 'Vlad Ionescu'], 'AP15',
        'Întunericul din interior iese la suprafață într-un oraș înghețat.',
        '/posters/beast.jpg',
        'https://www.youtube.com/watch?v=8iNHGKcP0cM', 'NOW_SHOWING', CURRENT_DATE - 10),

       ('Diavolul se îmbracă de la Prada 2', 'The Devil Wears Prada 2', 125,
        ARRAY ['Comedie', 'Dramă'], 'David Frankel',
        ARRAY ['Meryl Streep', 'Anne Hathaway'], 'AP12',
        'Miranda Priestly revine în lumea modei cu noi provocări.',
        '/posters/diavolul-prada-2.jpg',
        'https://www.youtube.com/watch?v=e9HXmMnUEdE', 'NOW_SHOWING', CURRENT_DATE - 8),

       ('Protector', 'Protector', 92,
        ARRAY ['Acțiune', 'Thriller'], 'James Yu',
        ARRAY ['Chen Wei', 'Lin Zhao'], 'AP15',
        'Un agent trebuie să protejeze un martor într-un oraș ostil.',
        '/posters/protector.jpg',
        'https://www.youtube.com/watch?v=-hyEvH0JPpo', 'NOW_SHOWING', CURRENT_DATE - 6),

       ('Michael', 'Michael', 135,
        ARRAY ['Biografic', 'Dramă'], 'Antoine Fuqua',
        ARRAY ['Jaafar Jackson', 'Colman Domingo'], 'AP12',
        'Portretul lui Michael Jackson și drumul său artistic.',
        '/posters/michael.jpg',
        'https://www.youtube.com/watch?v=3zOLzsbOleM', 'NOW_SHOWING', CURRENT_DATE - 4),

       ('MUMIA de la Lee Cronin', 'The Mummy', 112,
        ARRAY ['Horror', 'Fantasy'], 'Lee Cronin',
        ARRAY ['Jack Reynor', 'Alba Baptista'], 'AP16',
        'Forțe antice se trezesc din nou sub ochii celor curajoși.',
        '/posters/mumia-lee-cronin.jpg',
        'https://www.youtube.com/watch?v=Pbn1yz2p0CU', 'NOW_SHOWING', CURRENT_DATE - 2),

       ('Scapă cine poate 2', 'Escape Room 2', 96,
        ARRAY ['Horror', 'Thriller'], 'Adam Robitel',
        ARRAY ['Taylor Russell', 'Logan Miller'], 'AP15',
        'O nouă rundă de camere mortale și puzzle-uri infernale.',
        '/posters/scapa-cine-poate-2.jpg',
        'https://www.youtube.com/watch?v=7K3sNRm8J0w', 'NOW_SHOWING', CURRENT_DATE - 1),

       ('Proiectul Hail Mary', 'Project Hail Mary', 132,
        ARRAY ['SF', 'Aventură'], 'Phil Lord',
        ARRAY ['Ryan Gosling'], 'AP12',
        'Un astronaut singur salvează omenirea cu știință și curaj.',
        '/posters/proiectul-hail-mary.jpg',
        'https://www.youtube.com/watch?v=P0XN3-n-2Lo', 'NOW_SHOWING', CURRENT_DATE),

       ('Passenger', 'Passenger', 104,
        ARRAY ['Thriller', 'Mister'], 'Carter Smith',
        ARRAY ['Chris Pratt', 'Florence Pugh'], 'AP15',
        'Un drum lung devine un coșmar când secretul ieșite la iveală.',
        '/posters/passenger.jpg',
        'https://www.youtube.com/watch?v=B_qj1YjI5a4', 'COMING_SOON', CURRENT_DATE + 14),

       ('Misiune la limita', 'Mission at the Limit', 110,
        ARRAY ['Acțiune', 'Spionaj'], 'Matthew Vaughn',
        ARRAY ['Henry Cavill', 'Priyanka Chopra'], 'AP15',
        'Echipa trebuie să oprească un plan global în ultima clipă.',
        '/posters/misiune-la-limita.jpg',
        'https://www.youtube.com/watch?v=vD3rSkPbRmI', 'COMING_SOON', CURRENT_DATE + 21),

       ('Backrooms', 'The Backrooms', 98,
        ARRAY ['Horror', 'SF'], 'Kane Parsons',
        ARRAY ['Sophie Thatcher'], 'AP16',
        'Coridoare infinite și sunete care nu ar trebui să existe.',
        '/posters/backrooms.jpg',
        'https://www.youtube.com/watch?v=0HjdiohVOik', 'COMING_SOON', CURRENT_DATE + 28),

       ('Ziua adevărului', 'Day of Truth', 101,
        ARRAY ['Dramă', 'Politic'], 'Dan Chișu',
        ARRAY ['Ana Ularu', 'Andi Vasluianu'], 'AP12',
        'Într-o zi electorală, destinele se decid în câteva ore.',
        '/posters/ziua-adevarului.jpg',
        'https://www.youtube.com/watch?v=oNMJow6YPpU', 'COMING_SOON', CURRENT_DATE + 35),

       ('Supergirl', 'Supergirl', 128,
        ARRAY ['Acțiune', 'Supereroi'], 'Craig Gillespie',
        ARRAY ['Milly Alcock'], 'AP12',
        'Kara Zor-El își asumă mantia și responsabilitățile eroului.',
        '/posters/supergirl.jpg',
        'https://www.youtube.com/watch?v=s1-pfiVMKAs', 'COMING_SOON', CURRENT_DATE + 42),

       ('Billie Eilish: Hit Me Hard and Soft - The Tour Live',
        'Billie Eilish: Hit Me Hard and Soft - The Tour Live', 115,
        ARRAY ['Concert', 'Documentar'], 'Various',
        ARRAY ['Billie Eilish'], 'AP12',
        'Experiența turneului live captată pentru marele ecran.',
        '/posters/billie-eilish-tour.jpg',
        'https://www.youtube.com/watch?v=l2xnz7KLdwM', 'COMING_SOON', CURRENT_DATE + 49),

       ('Iron Maiden: Burning Ambition', 'Iron Maiden: Burning Ambition', 108,
        ARRAY ['Concert', 'Rock'], 'Iron Maiden',
        ARRAY ['Bruce Dickinson'], 'AP15',
        'Metal legendar pe scenă — energie pură și riff-uri clasice.',
        '/posters/iron-maiden-burning-ambition.jpg',
        'https://www.youtube.com/watch?v=BggdJLnSevQ', 'COMING_SOON', CURRENT_DATE + 54);

INSERT INTO screenings (movie_id, hall_id, starts_at, format, language, base_price)
VALUES
    (1, 1, date_trunc('day', CURRENT_TIMESTAMP) + interval '1 day' + interval '14 hours', 'TWO_D', 'RO', 40),
    (2, 1, date_trunc('day', CURRENT_TIMESTAMP) + interval '1 day' + interval '17 hours 30 minutes', 'TWO_D','RO', 42),
    (3, 2, date_trunc('day', CURRENT_TIMESTAMP) + interval '1 day' + interval '11 hours', 'TWO_D', 'RU', 38),
    (4, 3, date_trunc('day', CURRENT_TIMESTAMP) + interval '1 day' + interval '19 hours', 'TWO_D', 'EN', 48),
    (5, 2, date_trunc('day', CURRENT_TIMESTAMP) + interval '1 day' + interval '21 hours', 'TWO_D', 'RU', 41),

    (1, 3, date_trunc('day', CURRENT_TIMESTAMP) + interval '2 days' + interval '13 hours', 'TWO_D', 'EN', 39),
    (2, 1, date_trunc('day', CURRENT_TIMESTAMP) + interval '2 days' + interval '20 hours', 'TWO_D', 'RU', 40),
    (7, 2, date_trunc('day', CURRENT_TIMESTAMP) + interval '2 days' + interval '16 hours', 'TWO_D', 'RO', 44),

    (3, 1, date_trunc('day', CURRENT_TIMESTAMP) + interval '3 days' + interval '15 hours', 'TWO_D', 'RU', 38),
    (4, 2, date_trunc('day', CURRENT_TIMESTAMP) + interval '3 days' + interval '18 hours', 'TWO_D', 'RO', 45),
    (5, 3, date_trunc('day', CURRENT_TIMESTAMP) + interval '3 days' + interval '22 hours', 'TWO_D', 'RU', 42),

    (1, 2, date_trunc('day', CURRENT_TIMESTAMP) + interval '4 days' + interval '12 hours', 'TWO_D', 'RO', 37),
    (6, 1, date_trunc('day', CURRENT_TIMESTAMP) + interval '4 days' + interval '17 hours', 'TWO_D', 'RU', 39),
    (7, 3, date_trunc('day', CURRENT_TIMESTAMP) + interval '4 days' + interval '19 hours 30 minutes', 'TWO_D', 'EN',46),

    (2, 3, date_trunc('day', CURRENT_TIMESTAMP) + interval '5 days' + interval '14 hours', 'TWO_D', 'RO', 41),
    (6, 1, date_trunc('day', CURRENT_TIMESTAMP) + interval '5 days' + interval '18 hours', 'TWO_D', 'RU', 38),
    (4, 2, date_trunc('day', CURRENT_TIMESTAMP) + interval '5 days' + interval '10 hours', 'TWO_D', 'EN', 44),

    (3, 2, date_trunc('day', CURRENT_TIMESTAMP) + interval '6 days' + interval '16 hours', 'TWO_D', 'RU', 38),
    (4, 1, date_trunc('day', CURRENT_TIMESTAMP) + interval '6 days' + interval '21 hours', 'TWO_D', 'EN', 47),
    (5, 3, date_trunc('day', CURRENT_TIMESTAMP) + interval '6 days' + interval '11 hours', 'TWO_D', 'RU', 36),

    (5, 2, date_trunc('day', CURRENT_TIMESTAMP) + interval '7 days' + interval '15 hours', 'TWO_D', 'RU', 40),
    (1, 3, date_trunc('day', CURRENT_TIMESTAMP) + interval '7 days' + interval '19 hours', 'TWO_D', 'RO', 43),
    (3, 1, date_trunc('day', CURRENT_TIMESTAMP) + interval '7 days' + interval '12 hours', 'TWO_D', 'RU', 37),

    (2, 2, date_trunc('day', CURRENT_TIMESTAMP) + interval '8 days' + interval '17 hours', 'TWO_D', 'RO', 40),
    (7, 3, date_trunc('day', CURRENT_TIMESTAMP) + interval '8 days' + interval '20 hours', 'TWO_D', 'RO', 45);
