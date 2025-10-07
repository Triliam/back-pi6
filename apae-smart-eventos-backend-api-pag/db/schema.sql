-- [001] - create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    user_type ENUM('admin', 'associate') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- [002] - create events table
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    location VARCHAR(300) NOT NULL, 
    date_time DATETIME NOT NULL,
    duration_minutes INT,
    event_type ENUM('public', 'private'),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- [003] - create event_ticket_types table
CREATE TABLE event_ticket_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    name VARCHAR (100) NOT NULL,
    description TEXT,
    price FLOAT,
    quantity INT NOT NULL,

    FOREIGN KEY (event_id) REFERENCES events (id)
);

-- [004] - create tickets table
CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_type_id INT NOT NULL,
    associate_id INT NOT NULL,
    status ENUM('used', 'not used', 'expired', 'waiting payment'),
    used_at DATETIME,
    purchased_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (associate_id) REFERENCES users (id)
    FOREIGN KEY (ticket_type_id) REFERENCES event_ticket_types (id)
);

-- [005] - add "qr_code_id" column to tickets table
ALTER TABLE tickets ADD qr_code_id VARCHAR(36) UNIQUE;

-- [006] - add "cover_image_bucket" and "cover_image_path" to events table
ALTER TABLE events ADD cover_image_bucket VARCHAR(100);
ALTER TABLE events ADD cover_image_path VARCHAR(100);
