ALTER TABLE movies
    ADD COLUMN formats TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE movies
    ADD COLUMN languages TEXT[] NOT NULL DEFAULT '{}';

UPDATE movies
SET formats = ARRAY ['2D'],
    languages = ARRAY ['EN', 'RO', 'RU']
WHERE title = 'Bestia din mine';

UPDATE movies
SET formats = ARRAY ['2D'],
    languages = ARRAY ['EN', 'RO', 'RU']
WHERE title = 'Diavolul se îmbracă de la Prada 2';

UPDATE movies
SET formats = ARRAY ['2D'],
    languages = ARRAY ['RU']
WHERE title = 'Protector';

UPDATE movies
SET formats = ARRAY ['2D'],
    languages = ARRAY ['EN', 'RO', 'RU']
WHERE title = 'Michael';

UPDATE movies
SET formats = ARRAY ['2D'],
    languages = ARRAY ['RU']
WHERE title = 'MUMIA de la Lee Cronin';

UPDATE movies
SET formats = ARRAY ['2D'],
    languages = ARRAY ['RU']
WHERE title = 'Scapă cine poate 2';

UPDATE movies
SET formats = ARRAY ['2D'],
    languages = ARRAY ['EN', 'RO', 'RU']
WHERE title = 'Proiectul Hail Mary';

UPDATE movies
SET formats = ARRAY ['2D'],
    languages = ARRAY ['EN', 'RO', 'RU']
WHERE title = 'Passenger';

UPDATE movies
SET formats = ARRAY ['2D'],
    languages = ARRAY ['EN', 'RO', 'RU']
WHERE title = 'Misiune la limita';

UPDATE movies
SET formats = ARRAY ['2D'],
    languages = ARRAY ['EN', 'RO', 'RU']
WHERE title = 'Backrooms';

UPDATE movies
SET formats = ARRAY ['2D'],
    languages = ARRAY ['EN', 'RO', 'RU']
WHERE title = 'Ziua adevărului';

UPDATE movies
SET formats = ARRAY ['2D'],
    languages = ARRAY ['EN', 'RO', 'RU']
WHERE title = 'Supergirl';

UPDATE movies
SET formats = ARRAY ['3D'],
    languages = ARRAY ['EN']
WHERE title = 'Billie Eilish: Hit Me Hard and Soft - The Tour Live';

UPDATE movies
SET formats = ARRAY ['2D'],
    languages = ARRAY ['EN']
WHERE title = 'Iron Maiden: Burning Ambition';

UPDATE movies
SET trailer_url = 'https://www.youtube.com/watch?v=s1-pfiVMKAs'
WHERE title = 'Supergirl';
