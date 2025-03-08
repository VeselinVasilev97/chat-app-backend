-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS chatuser;

-- Set the search path to our schema
SET search_path TO chatuser;

-- Create the extension (must be done with superuser privileges)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the table in our schema
CREATE TABLE chatuser.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 