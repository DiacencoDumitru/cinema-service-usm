ALTER TABLE movies ADD COLUMN synopsis_ru TEXT;
ALTER TABLE movies ADD COLUMN synopsis_en TEXT;

UPDATE movies SET synopsis_ru = synopsis WHERE synopsis IS NOT NULL;
UPDATE movies SET synopsis_en = synopsis WHERE synopsis IS NOT NULL;
