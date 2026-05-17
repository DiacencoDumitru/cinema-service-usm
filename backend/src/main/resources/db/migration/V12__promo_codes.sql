CREATE TABLE promo_codes (
    code VARCHAR(32) PRIMARY KEY,
    discount_percent INT NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
    valid_until TIMESTAMPTZ,
    max_uses INT,
    used_count INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO promo_codes (code, discount_percent, max_uses, active)
VALUES ('WELCOME10', 10, 10000, TRUE);

ALTER TABLE bookings ADD COLUMN promo_code VARCHAR(32);
