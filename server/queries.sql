CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at DATE NOT NULL DEFAULT CURRENT_DATE,
    completed_at TIMESTAMP,
    time_spent INT,
    minutes INTEGER DEFAULT 25,
    paused_at TIMESTAMP
);

