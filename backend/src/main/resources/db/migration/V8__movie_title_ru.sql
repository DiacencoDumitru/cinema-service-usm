ALTER TABLE movies ADD COLUMN title_ru VARCHAR(500);

UPDATE movies SET title_ru = 'Зверь внутри' WHERE title = 'Bestia din mine';
UPDATE movies SET title_ru = 'Дьявол носит Prada 2' WHERE title = 'Diavolul se îmbracă de la Prada 2';
UPDATE movies SET title_ru = 'Защитник' WHERE title = 'Protector';
UPDATE movies SET title_ru = 'Майкл' WHERE title = 'Michael';
UPDATE movies SET title_ru = 'Мумия' WHERE title = 'MUMIA de la Lee Cronin';
UPDATE movies SET title_ru = 'Кто успел — спасся 2' WHERE title = 'Scapă cine poate 2';
UPDATE movies SET title_ru = 'Проект «Хайл Мэри»' WHERE title = 'Proiectul Hail Mary';
UPDATE movies SET title_ru = 'Пассажир' WHERE title = 'Passenger';
UPDATE movies SET title_ru = 'Миссия на пределе' WHERE title = 'Misiune la limita';
UPDATE movies SET title_ru = 'Закулисье' WHERE title = 'Backrooms';
UPDATE movies SET title_ru = 'День правды' WHERE title = 'Ziua adevărului';
UPDATE movies SET title_ru = 'Супергёрл' WHERE title = 'Supergirl';
UPDATE movies SET title_ru = 'Billie Eilish: Hit Me Hard and Soft — концерт' WHERE title LIKE 'Billie Eilish%';
UPDATE movies SET title_ru = 'Iron Maiden: Burning Ambition' WHERE title = 'Iron Maiden: Burning Ambition';
