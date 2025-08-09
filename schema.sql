-- Enable PostGIS for geospatial features
CREATE EXTENSION IF NOT EXISTS postgis;

-- USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'operator', 'reviewer')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- BASE STATIONS TABLE
CREATE TABLE base_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    location geometry(Point, 4326) NOT NULL,
    capacity_liters INTEGER NOT NULL,
    current_fill_liters INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL CHECK (status IN ('available', 'full', 'offline'))
);

-- DRONES TABLE
CREATE TABLE drones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    nickname VARCHAR(50),
    model VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    battery_level INTEGER CHECK (battery_level BETWEEN 0 AND 100),
    status VARCHAR(20) CHECK (status IN ('idle', 'in_mission', 'charging', 'offline')),
    base_station_id UUID REFERENCES base_stations(id),
    last_checkin TIMESTAMPTZ
);

-- MISSIONS TABLE
CREATE TABLE missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES users(id) NOT NULL,
    drone_id UUID REFERENCES drones(id) NOT NULL,
    base_station_id UUID REFERENCES base_stations(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('created', 'in_progress', 'completed', 'aborted')),
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    total_detections INTEGER DEFAULT 0,
    total_collected INTEGER DEFAULT 0,
    alert_triggered BOOLEAN DEFAULT false,
    notes TEXT
);

-- MISSION ROUTES TABLE
CREATE TABLE mission_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
    sequence INTEGER NOT NULL,
    location geometry(Point, 4326) NOT NULL,
    altitude_m REAL,
    timestamp TIMESTAMPTZ
);

-- IMAGE REVIEWS TABLE
CREATE TABLE image_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_id TEXT NOT NULL, -- This links to MongoDB's ObjectId as a string
    mission_id UUID REFERENCES missions(id),
    reviewer_id UUID REFERENCES users(id),
    decision BOOLEAN,
    reviewed_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- MISSION LOGS TABLE
CREATE TABLE mission_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    latlon geometry(Point, 4326)
);
