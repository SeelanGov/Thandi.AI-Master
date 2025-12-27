-- Create school magic links table for authentication
CREATE TABLE IF NOT EXISTS school_magic_links (
  id SERIAL PRIMARY KEY,
  school_id VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_school_magic_links_token ON school_magic_links(token);
CREATE INDEX IF NOT EXISTS idx_school_magic_links_school_id ON school_magic_links(school_id);
CREATE INDEX IF NOT EXISTS idx_school_magic_links_expires_at ON school_magic_links(expires_at);

-- Add foreign key constraint to schools table
ALTER TABLE school_magic_links 
ADD CONSTRAINT fk_school_magic_links_school_id 
FOREIGN KEY (school_id) REFERENCES schools(school_id) ON DELETE CASCADE;

-- Clean up expired tokens (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_magic_links()
RETURNS void AS $$
BEGIN
  DELETE FROM school_magic_links 
  WHERE expires_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up expired tokens (if pg_cron is available)
-- SELECT cron.schedule('cleanup-magic-links', '0 2 * * *', 'SELECT cleanup_expired_magic_links();');