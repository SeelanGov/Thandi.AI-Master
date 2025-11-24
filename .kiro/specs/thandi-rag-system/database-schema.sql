-- ============================================================================
-- THANDI RAG SYSTEM - DATABASE SCHEMA
-- Sprint 1-2: Priority Modules (1, 2, 3, 6, 7)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Knowledge modules registry
CREATE TABLE knowledge_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    priority INTEGER DEFAULT 1,
    last_updated TIMESTAMP DEFAULT NOW(),
    version INTEGER DEFAULT 1
);

-- Insert priority modules for Sprint 1-2
INSERT INTO knowledge_modules (module_name, description, priority) VALUES
('sa_universities', 'South African universities: admission requirements, fees, programs', 1),
('bursaries', 'SA bursaries and scholarships: deadlines, amounts, eligibility', 1),
('careers', 'Career database: descriptions, salaries, qualifications, growth outlook', 1),
('subject_career_mapping', 'Matric subjects to career pathways mapping', 1),
('4ir_emerging_jobs', 'Fourth Industrial Revolution and emerging careers', 1),
('tvet_colleges', 'TVET colleges: programs, costs, locations', 2),
('nsfas', 'NSFAS funding information and application process', 2),
('study_costs', 'Breakdown of university costs and budgeting', 2),
('alternative_pathways', 'Learnerships, apprenticeships, part-time study', 2),
('university_alternatives', 'Online learning, bootcamps, certifications', 2);

-- ============================================================================
-- MODULE 1: SA UNIVERSITIES
-- ============================================================================

CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_code VARCHAR(20) NOT NULL UNIQUE, -- 'uct', 'wits', 'up', etc.
    university_name VARCHAR(200) NOT NULL,
    province VARCHAR(50) NOT NULL,
    university_type VARCHAR(20) DEFAULT 'public', -- 'public', 'private'
    website_url TEXT,
    contact_info JSONB, -- {email, phone, address}
    ranking_info JSONB, -- {national_rank, research_rating}
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE university_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
    program_code VARCHAR(50) NOT NULL, -- 'BSC_CS', 'BCOM_ACC', etc.
    program_name VARCHAR(200) NOT NULL,
    faculty VARCHAR(100) NOT NULL,
    degree_type VARCHAR(50) NOT NULL, -- 'Bachelor', 'Diploma', 'Certificate'
    duration_years DECIMAL(2,1) NOT NULL,
    nqf_level INTEGER, -- 5-10
    annual_tuition_min INTEGER, -- In Rands
    annual_tuition_max INTEGER,
    admission_requirements JSONB NOT NULL, -- {aps_score, subject_requirements}
    career_outcomes TEXT[], -- Array of typical careers
    program_description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(university_id, program_code)
);

-- Example admission_requirements JSONB structure:
-- {
--   "aps_score": 35,
--   "minimum_aps": 30,
--   "subjects": [
--     {"name": "Mathematics", "minimum_level": 5, "required": true},
--     {"name": "Physical Science", "minimum_level": 4, "required": true},
--     {"name": "English", "minimum_level": 4, "required": true}
--   ],
--   "additional_requirements": "NSC with Bachelor's pass"
-- }

-- ============================================================================
-- MODULE 2: BURSARIES
-- ============================================================================

CREATE TABLE bursaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bursary_code VARCHAR(50) NOT NULL UNIQUE, -- 'sasol_eng', 'fnb_tech', etc.
    bursary_name VARCHAR(200) NOT NULL,
    provider_name VARCHAR(200) NOT NULL,
    provider_type VARCHAR(50), -- 'corporate', 'government', 'ngo', 'university'
    bursary_type VARCHAR(50) NOT NULL, -- 'full', 'partial', 'loan'
    amount_description TEXT NOT NULL, -- "Full tuition + R5K/month stipend"
    amount_min INTEGER, -- Minimum amount in Rands (if applicable)
    amount_max INTEGER, -- Maximum amount in Rands
    fields_of_study TEXT[] NOT NULL, -- ['engineering', 'science', 'technology']
    target_demographics JSONB, -- {race, gender, province, disability}
    eligibility_criteria JSONB NOT NULL,
    application_deadline DATE,
    application_opens DATE,
    application_url TEXT,
    contact_info JSONB,
    work_back_required BOOLEAN DEFAULT false,
    work_back_years INTEGER,
    renewable BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Example eligibility_criteria JSONB structure:
-- {
--   "academic": {
--     "minimum_average": 70,
--     "required_subjects": ["Mathematics", "Physical Science"],
--     "minimum_subject_level": 5
--   },
--   "financial": {
--     "household_income_max": 350000,
--     "means_test_required": true
--   },
--   "other": {
--     "sa_citizen": true,
--     "age_max": 25,
--     "first_time_student": false
--   }
-- }

-- ============================================================================
-- MODULE 3: CAREERS DATABASE
-- ============================================================================

CREATE TABLE careers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    career_code VARCHAR(50) NOT NULL UNIQUE, -- 'data_scientist', 'nurse', etc.
    career_title VARCHAR(200) NOT NULL,
    career_category VARCHAR(100) NOT NULL, -- 'Technology', 'Healthcare', 'Business'
    career_subcategory VARCHAR(100), -- 'Software Development', 'Nursing', 'Finance'
    short_description TEXT NOT NULL, -- 2-3 sentences
    detailed_description TEXT,
    typical_tasks TEXT[], -- Array of typical daily tasks
    work_environment VARCHAR(100), -- 'Office', 'Hospital', 'Remote', 'Field'
    required_education VARCHAR(100) NOT NULL, -- 'Bachelor's Degree', 'Diploma', 'Certificate'
    required_qualifications TEXT[] NOT NULL, -- Specific degrees/certifications
    required_subjects TEXT[], -- Matric subjects needed
    alternative_pathways TEXT[], -- Non-traditional entry routes
    salary_entry_min INTEGER NOT NULL, -- Monthly in Rands
    salary_entry_max INTEGER NOT NULL,
    salary_mid_min INTEGER, -- 3-5 years experience
    salary_mid_max INTEGER,
    salary_senior_min INTEGER, -- 5+ years experience
    salary_senior_max INTEGER,
    job_outlook VARCHAR(50) NOT NULL, -- 'high_growth', 'stable', 'declining'
    growth_rate_percentage DECIMAL(4,1), -- Annual growth rate
    demand_level VARCHAR(20) NOT NULL, -- 'very_high', 'high', 'medium', 'low'
    skills_required TEXT[] NOT NULL,
    personality_traits TEXT[], -- Helpful personality characteristics
    related_careers TEXT[], -- Similar career options
    typical_employers TEXT[], -- Types of companies/organizations
    sa_specific_info JSONB, -- SA market context, companies hiring, etc.
    created_at TIMESTAMP DEFAULT NOW()
);

-- Example sa_specific_info JSONB structure:
-- {
--   "sa_companies_hiring": ["Capitec", "Discovery", "Takealot", "Standard Bank"],
--   "critical_skill": true,
--   "scarce_skill": false,
--   "government_priority": true,
--   "provincial_demand": {"gauteng": "high", "western_cape": "high", "kwazulu_natal": "medium"},
--   "unemployment_rate": 5.2,
--   "notes": "High demand due to digital transformation initiatives"
-- }

-- ============================================================================
-- MODULE 6: SUBJECT-CAREER MAPPING
-- ============================================================================

CREATE TABLE subject_career_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_name VARCHAR(100) NOT NULL, -- 'Mathematics', 'Life Sciences', etc.
    subject_level VARCHAR(20), -- 'HL' (Higher Level) or 'SL' (Standard Level)
    career_code VARCHAR(50) NOT NULL, -- References careers.career_code
    importance_level VARCHAR(20) NOT NULL, -- 'essential', 'highly_recommended', 'recommended', 'helpful'
    minimum_mark_percentage INTEGER, -- Minimum mark needed (e.g., 60, 70)
    alternative_subjects TEXT[], -- Other subjects that could substitute
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (career_code) REFERENCES careers(career_code) ON DELETE CASCADE
);

CREATE TABLE subject_combinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    combination_name VARCHAR(200) NOT NULL, -- 'STEM Track', 'Commerce Track', etc.
    subjects TEXT[] NOT NULL, -- Array of subject names
    suitable_careers TEXT[] NOT NULL, -- Array of career codes
    unsuitable_careers TEXT[], -- Careers this combination closes doors to
    description TEXT,
    recommendations TEXT, -- Advice for students with this combination
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- MODULE 7: 4IR & EMERGING JOBS
-- ============================================================================

CREATE TABLE emerging_careers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    career_code VARCHAR(50) NOT NULL UNIQUE,
    career_title VARCHAR(200) NOT NULL,
    emergence_year INTEGER, -- When this career became prominent
    technology_category VARCHAR(100) NOT NULL, -- 'AI/ML', 'Green Energy', 'Fintech', etc.
    disruption_level VARCHAR(20) NOT NULL, -- 'transformative', 'high', 'medium'
    maturity_stage VARCHAR(50) NOT NULL, -- 'emerging', 'growing', 'established'
    sa_adoption_level VARCHAR(20) NOT NULL, -- 'early', 'growing', 'mainstream'
    short_description TEXT NOT NULL,
    skills_required TEXT[] NOT NULL,
    traditional_career_equivalent VARCHAR(200), -- What career this is evolving from
    education_pathways TEXT[] NOT NULL,
    salary_range_description TEXT NOT NULL,
    salary_entry_min INTEGER,
    salary_entry_max INTEGER,
    growth_projection_5yr VARCHAR(100) NOT NULL, -- "Expected to grow 40% by 2030"
    sa_companies_hiring TEXT[],
    government_initiatives TEXT[], -- Relevant SA government programs
    learning_resources TEXT[], -- Where to learn these skills
    related_emerging_careers TEXT[],
    automation_risk VARCHAR(20), -- 'low', 'medium', 'high'
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- TEXT CHUNKS FOR RAG (ALL MODULES)
-- ============================================================================

CREATE TABLE knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES knowledge_modules(id) ON DELETE CASCADE,
    source_entity_id UUID, -- References specific entity (university, bursary, career)
    source_entity_type VARCHAR(50), -- 'university', 'bursary', 'career', 'ideal_answer'
    chunk_text TEXT NOT NULL,
    chunk_metadata JSONB, -- {source, tags, categories, question_id}
    embedding vector(1536), -- OpenAI ada-002 embeddings
    created_at TIMESTAMP DEFAULT NOW()
);

-- Example chunk_metadata JSONB structure:
-- {
--   "source": "PRD_Q1_ideal_answer",
--   "question_id": "Q1",
--   "tags": ["mathematics", "career_matching", "no_physics"],
--   "categories": ["subject_career_matching"],
--   "entity_references": ["data_scientist", "actuarial_science", "computer_science"]
-- }

-- ============================================================================
-- STUDENT ASSESSMENTS & RECOMMENDATIONS
-- ============================================================================

CREATE TABLE student_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    assessment_data JSONB NOT NULL, -- All 15-20 question responses
    student_profile JSONB, -- Processed profile for RAG
    completed_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'completed', -- 'completed', 'processing', 'failed'
    -- Deep dive assessment fields (Day 1 addition)
    grade INTEGER, -- 10, 11, or 12
    assessment_depth VARCHAR(20) DEFAULT 'quick', -- 'quick' or 'comprehensive'
    support_system JSONB, -- Available support for improving marks
    career_awareness_level VARCHAR(50), -- 'exactly-know', 'some-ideas', 'completely-unsure'
    family_expectations VARCHAR(50), -- 'aligned', 'somewhat-different', 'very-different', 'none'
    location_flexibility VARCHAR(50), -- 'anywhere', 'nearby-cities', 'must-stay-province', 'must-stay-home'
    decision_style VARCHAR(50) -- 'have-backup-plans', 'open-to-alternatives', 'only-first-choice', 'not-sure'
);

-- Subject performance tracking (for deep dive Q5: current marks)
CREATE TABLE subject_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES student_assessments(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    mark_range VARCHAR(20) NOT NULL, -- '0-39%', '40-49%', '50-59%', '60-69%', '70-79%', '80-100%'
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES student_assessments(id) ON DELETE CASCADE,
    recommendations JSONB NOT NULL, -- Array of 3-5 career matches
    generation_metadata JSONB, -- Model used, processing time, chunks retrieved
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- TEST SUITE TRACKING
-- ============================================================================

CREATE TABLE test_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id VARCHAR(10) NOT NULL UNIQUE, -- 'Q1', 'Q2', etc.
    category VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    ideal_answer TEXT NOT NULL,
    key_points TEXT[] NOT NULL, -- Array of key points for scoring
    required_modules TEXT[] NOT NULL, -- Which modules should be used
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_question_id VARCHAR(10) NOT NULL,
    test_run_id UUID NOT NULL, -- Group tests by run
    test_input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    actual_output TEXT,
    key_points_covered INTEGER, -- How many key points were covered
    total_key_points INTEGER,
    pass_score DECIMAL(3,2), -- 0.0 to 1.0
    passed BOOLEAN,
    processing_time_ms INTEGER,
    chunks_retrieved JSONB, -- Which chunks were used
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (test_question_id) REFERENCES test_questions(question_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Vector search index (requires pgvector)
CREATE INDEX idx_knowledge_chunks_embedding ON knowledge_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Structured data indexes
CREATE INDEX idx_universities_province ON universities(province);
CREATE INDEX idx_university_programs_university ON university_programs(university_id);
CREATE INDEX idx_university_programs_degree_type ON university_programs(degree_type);

CREATE INDEX idx_bursaries_provider ON bursaries(provider_name);
CREATE INDEX idx_bursaries_deadline ON bursaries(application_deadline);
CREATE INDEX idx_bursaries_fields ON bursaries USING GIN(fields_of_study);

CREATE INDEX idx_careers_category ON careers(career_category);
CREATE INDEX idx_careers_outlook ON careers(job_outlook);
CREATE INDEX idx_careers_demand ON careers(demand_level);

CREATE INDEX idx_subject_mappings_subject ON subject_career_mappings(subject_name);
CREATE INDEX idx_subject_mappings_career ON subject_career_mappings(career_code);

CREATE INDEX idx_emerging_tech_category ON emerging_careers(technology_category);
CREATE INDEX idx_emerging_adoption ON emerging_careers(sa_adoption_level);

CREATE INDEX idx_chunks_module ON knowledge_chunks(module_id);
CREATE INDEX idx_chunks_entity ON knowledge_chunks(source_entity_id);

CREATE INDEX idx_assessments_school ON student_assessments(school_id);
CREATE INDEX idx_assessments_status ON student_assessments(status);
CREATE INDEX idx_assessments_grade ON student_assessments(grade);
CREATE INDEX idx_subject_performance_assessment ON subject_performance(assessment_id);

CREATE INDEX idx_test_results_run ON test_results(test_run_id);
CREATE INDEX idx_test_results_question ON test_results(test_question_id);

-- ============================================================================
-- ROW LEVEL SECURITY (POPIA COMPLIANCE)
-- ============================================================================

-- Enable RLS on sensitive tables
ALTER TABLE student_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Schools can only see their own students' data
CREATE POLICY school_isolation_assessments ON student_assessments
    FOR ALL
    USING (school_id = current_setting('app.current_school_id')::UUID);

CREATE POLICY school_isolation_recommendations ON recommendations
    FOR ALL
    USING (
        assessment_id IN (
            SELECT id FROM student_assessments 
            WHERE school_id = current_setting('app.current_school_id')::UUID
        )
    );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to search knowledge chunks by embedding similarity
CREATE OR REPLACE FUNCTION search_knowledge_chunks(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10,
    filter_module_ids UUID[] DEFAULT NULL
)
RETURNS TABLE (
    chunk_id UUID,
    chunk_text TEXT,
    similarity float,
    metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        kc.id,
        kc.chunk_text,
        1 - (kc.embedding <=> query_embedding) as similarity,
        kc.chunk_metadata
    FROM knowledge_chunks kc
    WHERE 
        (filter_module_ids IS NULL OR kc.module_id = ANY(filter_module_ids))
        AND 1 - (kc.embedding <=> query_embedding) > match_threshold
    ORDER BY kc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Function to get student profile summary
CREATE OR REPLACE FUNCTION get_student_profile_summary(assessment_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    profile_summary JSONB;
BEGIN
    SELECT student_profile INTO profile_summary
    FROM student_assessments
    WHERE id = assessment_id_param;
    
    RETURN profile_summary;
END;
$$;

-- ============================================================================
-- SAMPLE DATA QUERIES (FOR TESTING)
-- ============================================================================

-- Query to check module setup
-- SELECT * FROM knowledge_modules ORDER BY priority, module_name;

-- Query to test vector search
-- SELECT * FROM search_knowledge_chunks(
--     (SELECT embedding FROM knowledge_chunks LIMIT 1),
--     0.7,
--     5,
--     ARRAY(SELECT id FROM knowledge_modules WHERE priority = 1)
-- );

-- Query to check test suite status
-- SELECT 
--     tq.category,
--     COUNT(*) as total_questions,
--     SUM(CASE WHEN tr.passed THEN 1 ELSE 0 END) as passed,
--     ROUND(AVG(tr.pass_score) * 100, 1) as avg_score_pct
-- FROM test_questions tq
-- LEFT JOIN test_results tr ON tq.question_id = tr.test_question_id
-- WHERE tr.test_run_id = (SELECT MAX(test_run_id) FROM test_results)
-- GROUP BY tq.category;
