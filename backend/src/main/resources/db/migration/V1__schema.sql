CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(320) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE movies (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    original_title VARCHAR(500),
    duration_min INT NOT NULL,
    genres TEXT[] NOT NULL DEFAULT '{}',
    director VARCHAR(500),
    actors TEXT[] NOT NULL DEFAULT '{}',
    age_rating VARCHAR(32),
    synopsis TEXT,
    poster_url VARCHAR(2048),
    trailer_url VARCHAR(2048),
    status VARCHAR(32) NOT NULL,
    release_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE halls (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    rows_count INT NOT NULL,
    seats_per_row INT NOT NULL
);

CREATE TABLE seats (
    id BIGSERIAL PRIMARY KEY,
    hall_id BIGINT NOT NULL REFERENCES halls (id) ON DELETE CASCADE,
    row_num INT NOT NULL,
    col_num INT NOT NULL,
    seat_type VARCHAR(32) NOT NULL,
    UNIQUE (hall_id, row_num, col_num)
);

CREATE TABLE screenings (
    id BIGSERIAL PRIMARY KEY,
    movie_id BIGINT NOT NULL REFERENCES movies (id) ON DELETE CASCADE,
    hall_id BIGINT NOT NULL REFERENCES halls (id),
    starts_at TIMESTAMPTZ NOT NULL,
    format VARCHAR(16) NOT NULL,
    language VARCHAR(16) NOT NULL,
    base_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    UNIQUE (hall_id, starts_at)
);

CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users (id),
    screening_id BIGINT NOT NULL REFERENCES screenings (id),
    total_price NUMERIC(12, 2) NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE booking_seats (
    booking_id BIGINT NOT NULL REFERENCES bookings (id) ON DELETE CASCADE,
    seat_id BIGINT NOT NULL REFERENCES seats (id),
    price NUMERIC(12, 2) NOT NULL,
    PRIMARY KEY (booking_id, seat_id),
    UNIQUE (seat_id)
);

CREATE TABLE prices (
    category VARCHAR(32) NOT NULL,
    format VARCHAR(16) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    PRIMARY KEY (category, format)
);

CREATE INDEX idx_screenings_starts ON screenings (starts_at);
CREATE INDEX idx_screenings_movie ON screenings (movie_id);
CREATE INDEX idx_bookings_user ON bookings (user_id);
CREATE INDEX idx_bookings_screening ON bookings (screening_id);
