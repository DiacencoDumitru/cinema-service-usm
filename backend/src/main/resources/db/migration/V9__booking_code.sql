ALTER TABLE bookings ADD COLUMN booking_code VARCHAR(16);

UPDATE bookings
SET booking_code = 'AC' || upper(substring(md5(random()::text || id::text) from 1 for 8))
WHERE booking_code IS NULL;

ALTER TABLE bookings ALTER COLUMN booking_code SET NOT NULL;
CREATE UNIQUE INDEX idx_bookings_code ON bookings (booking_code);
