-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- Insert default admin user if not exists
INSERT INTO users (username, password_hash)
VALUES (
    'admin',
    'scrypt:32768:8:1$rL7xfTjMB17OCdaH$d58897c216e140bfe750563794a2bfb756607d07c4e7f3457e2cf2a4bd307cedf3ad131335a4ac80e37162939c4be3e12450a4b195769432c2b0a08d0cbee4f3'
)ON CONFLICT (username) DO NOTHING;

-- Insert default test user
INSERT INTO users (username, password_hash)
VALUES (
    'test',
    'scrypt:32768:8:1$AXXVv0STTRTxgtCz$4985cd8ba1800ffec19ba9e9b96a4d43271d6f737446ab25716770333fcaa5de8e63ac9668379334480b3fc8bd6ae647f2cd2fab5f1ed891501f142a0586a5bc'
)
ON CONFLICT (username) DO NOTHING;
