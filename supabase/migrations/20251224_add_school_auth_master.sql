-- School Authentication Master Data
-- This table stores the master list of all SA schools for authentication/claiming

CREATE TABLE IF NOT EXISTS school_master (
  id SERIAL PRIMARY KEY,
  school_id VARCHAR(50) UNIQUE NOT NULL, -- ZAF-P-500215340 format
  name TEXT NOT NULL,
  province VARCHAR(50) NOT NULL,
  type VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'unclaimed',
  principal_email VARCHAR(255),
  contact_phone VARCHAR(20),
  claimed_at TIMESTAMP,
  claimed_by_school_uuid UUID REFERENCES schools(id), -- Link to actual school record
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_school_master_school_id ON school_master(school_id);
CREATE INDEX IF NOT EXISTS idx_school_master_province ON school_master(province);
CREATE INDEX IF NOT EXISTS idx_school_master_status ON school_master(status);
CREATE INDEX IF NOT EXISTS idx_school_master_name ON school_master USING gin(to_tsvector('english', name));

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_school_master_updated_at()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_school_master_updated_at
  BEFORE UPDATE ON school_master
  FOR EACH ROW
  EXECUTE FUNCTION update_school_master_updated_at();

-- Function to search schools (fuzzy matching)
CREATE OR REPLACE FUNCTION search_schools(search_query TEXT, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  school_id VARCHAR(50),
  name TEXT,
  province VARCHAR(50),
  type VARCHAR(100),
  status VARCHAR(20)
) AS $
BEGIN
  RETURN QUERY
  SELECT 
    sm.school_id,
    sm.name,
    sm.province,
    sm.type,
    sm.status
  FROM school_master sm
  WHERE 
    sm.name ILIKE '%' || search_query || '%'
    OR sm.school_id ILIKE '%' || search_query || '%'
  ORDER BY 
    CASE 
      WHEN sm.name ILIKE search_query || '%' THEN 1
      WHEN sm.name ILIKE '%' || search_query || '%' THEN 2
      ELSE 3
    END,
    sm.name
  LIMIT limit_count;
END;
$ LANGUAGE plpgsql;

-- Function to claim a school
CREATE OR REPLACE FUNCTION claim_school(
  p_school_id VARCHAR(50),
  p_principal_email VARCHAR(255),
  p_school_uuid UUID DEFAULT NULL
)
RETURNS JSON AS $
DECLARE
  result JSON;
  school_exists BOOLEAN;
BEGIN
  -- Check if school exists and is unclaimed
  SELECT EXISTS(
    SELECT 1 FROM school_master 
    WHERE school_id = p_school_id AND status = 'unclaimed'
  ) INTO school_exists;
  
  IF NOT school_exists THEN
    RETURN json_build_object(
      'success', false,
      'error', 'School not found or already claimed'
    );
  END IF;
  
  -- Update school record
  UPDATE school_master 
  SET 
    status = 'claimed',
    principal_email = p_principal_email,
    claimed_at = NOW(),
    claimed_by_school_uuid = p_school_uuid,
    updated_at = NOW()
  WHERE school_id = p_school_id;
  
  RETURN json_build_object(
    'success', true,
    'school_id', p_school_id,
    'claimed_at', NOW()
  );
END;
$ LANGUAGE plpgsql;

-- RLS for security
ALTER TABLE school_master ENABLE ROW LEVEL SECURITY;

-- Allow public read access for search/claim functionality
CREATE POLICY "Allow public read access" ON school_master FOR SELECT USING (true);

-- Allow updates only for claiming (could be restricted further)
CREATE POLICY "Allow claiming schools" ON school_master FOR UPDATE USING (status = 'unclaimed');