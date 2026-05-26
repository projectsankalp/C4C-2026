-- schema.sql
-- Swachh Vayu Database Blueprint

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS nodes;
DROP TABLE IF EXISTS aqi_readings;
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS rankings;
DROP TABLE IF EXISTS languages;

CREATE TABLE languages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    native_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1
);

-- Seed default languages
INSERT INTO languages (code, name, native_name) VALUES 
    ('en', 'English', 'English'),
    ('hi', 'Hindi', 'हिंदी'),
    ('mr', 'Marathi', 'मराठी'),
    ('kn', 'Kannada', 'ಕನ್ನಡ'),
    ('ta', 'Tamil', 'தமிழ்'),
    ('te', 'Telugu', 'తెలుగు'),
    ('bn', 'Bengali', 'বাংলা'),
    ('gu', 'Gujarati', 'ગુજરાતી'),
    ('pa', 'Punjabi', 'ਪੰਜਾਬੀ'),
    ('ml', 'Malayalam', 'മലയാളം');

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    mobile_number TEXT UNIQUE NOT NULL,
    village_name TEXT NOT NULL,
    area_name TEXT,
    latitude REAL,
    longitude REAL,
    language_id INTEGER,
    alert_mode TEXT DEFAULT 'SMS',
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (language_id) REFERENCES languages (id)
);

CREATE TABLE nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_code TEXT UNIQUE NOT NULL,
    node_name TEXT NOT NULL,
    village TEXT NOT NULL,
    area TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    installation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active',
    battery_level INTEGER,
    last_seen TIMESTAMP,
    installed_by INTEGER,
    FOREIGN KEY (installed_by) REFERENCES users (id)
);

CREATE TABLE aqi_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id INTEGER NOT NULL,
    mq135_value REAL NOT NULL,
    calculated_aqi INTEGER NOT NULL,
    aqi_status TEXT NOT NULL,
    temperature REAL,
    humidity REAL,
    battery_level INTEGER,
    lora_signal_strength INTEGER,
    reading_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (node_id) REFERENCES nodes (id)
);

CREATE TABLE alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id INTEGER,
    user_id INTEGER NOT NULL,
    alert_type TEXT NOT NULL,
    message TEXT NOT NULL,
    language_id INTEGER,
    aqi_value INTEGER,
    severity_level TEXT NOT NULL,
    delivery_status TEXT DEFAULT 'Pending',
    alert_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (node_id) REFERENCES nodes (id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (language_id) REFERENCES languages (id)
);

CREATE TABLE rankings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    village_name TEXT NOT NULL,
    quarter TEXT NOT NULL,
    year INTEGER NOT NULL,
    average_aqi INTEGER NOT NULL,
    best_aqi INTEGER NOT NULL,
    worst_aqi INTEGER NOT NULL,
    reduction_percentage REAL,
    participation_score INTEGER,
    final_score REAL,
    rank_position INTEGER,
    reward_status TEXT DEFAULT 'Pending Evaluation'
);

-- Indexes for performance
CREATE INDEX idx_aqi_node_time ON aqi_readings (node_id, reading_time);
CREATE INDEX idx_alerts_user ON alerts (user_id);
CREATE INDEX idx_nodes_village ON nodes (village);
