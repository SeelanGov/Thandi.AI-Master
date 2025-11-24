-- ============================================================================
-- THANDI RAG SYSTEM - SAMPLE DATA
-- Sprint 1-2: Population of 5 Priority Modules
-- Run this AFTER database-schema.sql
-- ============================================================================

-- ============================================================================
-- MODULE 1: SA UNIVERSITIES (10 universities + programs)
-- ============================================================================

-- Insert Universities
INSERT INTO universities (university_code, university_name, province, university_type, website_url, contact_info, ranking_info) VALUES
('uct', 'University of Cape Town', 'Western Cape', 'public', 'https://www.uct.ac.za', 
 '{"email": "admissions@uct.ac.za", "phone": "+27 21 650 9111", "address": "Private Bag X3, Rondebosch, 7701"}'::jsonb,
 '{"national_rank": 1, "research_rating": "A+", "international_rank": 156}'::jsonb),

('wits', 'University of the Witwatersrand', 'Gauteng', 'public', 'https://www.wits.ac.za',
 '{"email": "admissions@wits.ac.za", "phone": "+27 11 717 1000", "address": "1 Jan Smuts Avenue, Braamfontein, 2000"}'::jsonb,
 '{"national_rank": 2, "research_rating": "A+", "international_rank": 194}'::jsonb),

('up', 'University of Pretoria', 'Gauteng', 'public', 'https://www.up.ac.za',
 '{"email": "admissions@up.ac.za", "phone": "+27 12 420 3111", "address": "Lynnwood Road, Pretoria, 0002"}'::jsonb,
 '{"national_rank": 3, "research_rating": "A", "international_rank": 251}'::jsonb),

('sun', 'Stellenbosch University', 'Western Cape', 'public', 'https://www.sun.ac.za',
 '{"email": "info@sun.ac.za", "phone": "+27 21 808 9111", "address": "Private Bag X1, Matieland, 7602"}'::jsonb,
 '{"national_rank": 4, "research_rating": "A", "international_rank": 264}'::jsonb),

('uj', 'University of Johannesburg', 'Gauteng', 'public', 'https://www.uj.ac.za',
 '{"email": "admissions@uj.ac.za", "phone": "+27 11 559 4555", "address": "PO Box 524, Auckland Park, 2006"}'::jsonb,
 '{"national_rank": 5, "research_rating": "B+", "international_rank": 401}'::jsonb),

('dut', 'Durban University of Technology', 'KwaZulu-Natal', 'public', 'https://www.dut.ac.za',
 '{"email": "admissions@dut.ac.za", "phone": "+27 31 373 2000", "address": "PO Box 1334, Durban, 4000"}'::jsonb,
 '{"national_rank": 12, "research_rating": "B", "international_rank": 601}'::jsonb),

('rhodes', 'Rhodes University', 'Eastern Cape', 'public', 'https://www.ru.ac.za',
 '{"email": "admissions@ru.ac.za", "phone": "+27 46 603 8111", "address": "PO Box 94, Makhanda, 6140"}'::jsonb,
 '{"national_rank": 8, "research_rating": "B+", "international_rank": 501}'::jsonb),

('nmu', 'Nelson Mandela University', 'Eastern Cape', 'public', 'https://www.mandela.ac.za',
 '{"email": "info@mandela.ac.za", "phone": "+27 41 504 1111", "address": "University Way, Summerstrand, 6031"}'::jsonb,
 '{"national_rank": 10, "research_rating": "B", "international_rank": 551}'::jsonb),

('ufh', 'University of Fort Hare', 'Eastern Cape', 'public', 'https://www.ufh.ac.za',
 '{"email": "admissions@ufh.ac.za", "phone": "+27 40 602 2011", "address": "Private Bag X1314, Alice, 5700"}'::jsonb,
 '{"national_rank": 15, "research_rating": "C+", "international_rank": 701}'::jsonb),

('nwu', 'North-West University', 'North West', 'public', 'https://www.nwu.ac.za',
 '{"email": "admissions@nwu.ac.za", "phone": "+27 18 299 1111", "address": "Private Bag X6001, Potchefstroom, 2520"}'::jsonb,
 '{"national_rank": 9, "research_rating": "B", "international_rank": 521}'::jsonb);

-- Insert University Programs (5 popular programs per university)
-- UCT Programs
INSERT INTO university_programs (university_id, program_code, program_name, faculty, degree_type, duration_years, nqf_level, annual_tuition_min, annual_tuition_max, admission_requirements, career_outcomes, program_description) VALUES
((SELECT id FROM universities WHERE university_code = 'uct'), 'BSC_CS', 'Bachelor of Science in Computer Science', 'Science', 'Bachelor', 3, 7, 45000, 55000,
 '{"aps_score": 38, "minimum_aps": 35, "subjects": [{"name": "Mathematics", "minimum_level": 6, "required": true}, {"name": "Physical Science", "minimum_level": 5, "required": false}, {"name": "English", "minimum_level": 5, "required": true}], "additional_requirements": "NSC with Bachelor pass"}'::jsonb,
 ARRAY['Software Developer', 'Data Scientist', 'Systems Analyst', 'IT Consultant'],
 'Comprehensive computer science degree covering programming, algorithms, data structures, and software engineering.'),

((SELECT id FROM universities WHERE university_code = 'uct'), 'BCOM_ACC', 'Bachelor of Commerce in Accounting', 'Commerce', 'Bachelor', 3, 7, 48000, 58000,
 '{"aps_score": 40, "minimum_aps": 38, "subjects": [{"name": "Mathematics", "minimum_level": 6, "required": true}, {"name": "Accounting", "minimum_level": 5, "required": false}, {"name": "English", "minimum_level": 5, "required": true}], "additional_requirements": "NSC with Bachelor pass"}'::jsonb,
 ARRAY['Chartered Accountant', 'Auditor', 'Financial Manager', 'Tax Consultant'],
 'Professional accounting degree leading to CA(SA) qualification with strong focus on financial reporting and auditing.'),

((SELECT id FROM universities WHERE university_code = 'uct'), 'BENG_MECH', 'Bachelor of Engineering in Mechanical Engineering', 'Engineering', 'Bachelor', 4, 8, 52000, 65000,
 '{"aps_score": 40, "minimum_aps": 38, "subjects": [{"name": "Mathematics", "minimum_level": 7, "required": true}, {"name": "Physical Science", "minimum_level": 6, "required": true}, {"name": "English", "minimum_level": 5, "required": true}], "additional_requirements": "NSC with Bachelor pass, NBT required"}'::jsonb,
 ARRAY['Mechanical Engineer', 'Design Engineer', 'Manufacturing Engineer', 'Project Engineer'],
 'ECSA-accredited engineering degree covering thermodynamics, mechanics, and design principles.'),

((SELECT id FROM universities WHERE university_code = 'uct'), 'BA_PSYCH', 'Bachelor of Arts in Psychology', 'Humanities', 'Bachelor', 3, 7, 42000, 52000,
 '{"aps_score": 35, "minimum_aps": 32, "subjects": [{"name": "English", "minimum_level": 5, "required": true}, {"name": "Mathematics", "minimum_level": 4, "required": false}, {"name": "Life Sciences", "minimum_level": 4, "required": false}], "additional_requirements": "NSC with Bachelor pass"}'::jsonb,
 ARRAY['Psychologist', 'HR Specialist', 'Counselor', 'Research Analyst'],
 'Comprehensive psychology degree covering cognitive, developmental, and social psychology with research methods.'),

((SELECT id FROM universities WHERE university_code = 'uct'), 'BSC_NURS', 'Bachelor of Science in Nursing', 'Health Sciences', 'Bachelor', 4, 8, 40000, 50000,
 '{"aps_score": 35, "minimum_aps": 32, "subjects": [{"name": "Life Sciences", "minimum_level": 5, "required": true}, {"name": "Mathematics", "minimum_level": 4, "required": true}, {"name": "English", "minimum_level": 5, "required": true}], "additional_requirements": "NSC with Bachelor pass, Medical fitness certificate"}'::jsonb,
 ARRAY['Registered Nurse', 'Clinical Nurse', 'Nurse Educator', 'Nurse Manager'],
 'Professional nursing degree registered with SANC, includes clinical practice and theory.');

-- Wits Programs
INSERT INTO university_programs (university_id, program_code, program_name, faculty, degree_type, duration_years, nqf_level, annual_tuition_min, annual_tuition_max, admission_requirements, career_outcomes, program_description) VALUES
((SELECT id FROM universities WHERE university_code = 'wits'), 'BSC_CS', 'Bachelor of Science in Computer Science', 'Science', 'Bachelor', 3, 7, 46000, 56000,
 '{"aps_score": 37, "minimum_aps": 34, "subjects": [{"name": "Mathematics", "minimum_level": 6, "required": true}, {"name": "Physical Science", "minimum_level": 5, "required": false}, {"name": "English", "minimum_level": 5, "required": true}]}'::jsonb,
 ARRAY['Software Developer', 'Data Scientist', 'AI Engineer'],
 'Top-tier computer science program with strong industry connections in Johannesburg tech sector.'),

((SELECT id FROM universities WHERE university_code = 'wits'), 'BCOM_ACC', 'Bachelor of Commerce in Accounting Sciences', 'Commerce', 'Bachelor', 3, 7, 49000, 59000,
 '{"aps_score": 39, "minimum_aps": 37, "subjects": [{"name": "Mathematics", "minimum_level": 6, "required": true}, {"name": "English", "minimum_level": 5, "required": true}]}'::jsonb,
 ARRAY['Chartered Accountant', 'Financial Analyst', 'Auditor'],
 'Premier accounting program with high CA(SA) pass rates and Big 4 recruitment.'),

((SELECT id FROM universities WHERE university_code = 'wits'), 'BENG_MECH', 'Bachelor of Engineering in Mechanical Engineering', 'Engineering', 'Bachelor', 4, 8, 53000, 66000,
 '{"aps_score": 39, "minimum_aps": 37, "subjects": [{"name": "Mathematics", "minimum_level": 7, "required": true}, {"name": "Physical Science", "minimum_level": 6, "required": true}]}'::jsonb,
 ARRAY['Mechanical Engineer', 'Mining Engineer', 'Automotive Engineer'],
 'ECSA-accredited with strong links to mining and manufacturing industries.'),

((SELECT id FROM universities WHERE university_code = 'wits'), 'BA_PSYCH', 'Bachelor of Arts in Psychology', 'Humanities', 'Bachelor', 3, 7, 43000, 53000,
 '{"aps_score": 34, "minimum_aps": 31, "subjects": [{"name": "English", "minimum_level": 5, "required": true}]}'::jsonb,
 ARRAY['Clinical Psychologist', 'Industrial Psychologist', 'Researcher'],
 'Research-intensive psychology program with clinical and industrial specializations.'),

((SELECT id FROM universities WHERE university_code = 'wits'), 'BSC_NURS', 'Bachelor of Science in Nursing', 'Health Sciences', 'Bachelor', 4, 8, 41000, 51000,
 '{"aps_score": 34, "minimum_aps": 31, "subjects": [{"name": "Life Sciences", "minimum_level": 5, "required": true}, {"name": "Mathematics", "minimum_level": 4, "required": true}]}'::jsonb,
 ARRAY['Registered Nurse', 'Nurse Practitioner', 'Healthcare Manager'],
 'SANC-registered program with clinical training at top Johannesburg hospitals.');

-- UP Programs
INSERT INTO university_programs (university_id, program_code, program_name, faculty, degree_type, duration_years, nqf_level, annual_tuition_min, annual_tuition_max, admission_requirements, career_outcomes, program_description) VALUES
((SELECT id FROM universities WHERE university_code = 'up'), 'BSC_CS', 'Bachelor of Science in Computer Science', 'Natural Sciences', 'Bachelor', 3, 7, 44000, 54000,
 '{"aps_score": 36, "minimum_aps": 33, "subjects": [{"name": "Mathematics", "minimum_level": 6, "required": true}, {"name": "English", "minimum_level": 5, "required": true}]}'::jsonb,
 ARRAY['Software Engineer', 'Systems Analyst', 'Database Administrator'],
 'Comprehensive CS program with focus on software engineering and data science.'),

((SELECT id FROM universities WHERE university_code = 'up'), 'BCOM_ACC', 'Bachelor of Commerce in Accounting', 'Economic Sciences', 'Bachelor', 3, 7, 47000, 57000,
 '{"aps_score": 38, "minimum_aps": 36, "subjects": [{"name": "Mathematics", "minimum_level": 6, "required": true}, {"name": "English", "minimum_level": 5, "required": true}]}'::jsonb,
 ARRAY['Chartered Accountant', 'Management Accountant', 'Tax Specialist'],
 'Strong accounting program with excellent CA(SA) conversion rates.'),

((SELECT id FROM universities WHERE university_code = 'up'), 'BENG_MECH', 'Bachelor of Engineering in Mechanical Engineering', 'Engineering', 'Bachelor', 4, 8, 51000, 64000,
 '{"aps_score": 38, "minimum_aps": 36, "subjects": [{"name": "Mathematics", "minimum_level": 7, "required": true}, {"name": "Physical Science", "minimum_level": 6, "required": true}]}'::jsonb,
 ARRAY['Mechanical Engineer', 'Energy Engineer', 'Manufacturing Engineer'],
 'ECSA-accredited with specializations in energy and automotive engineering.'),

((SELECT id FROM universities WHERE university_code = 'up'), 'BA_PSYCH', 'Bachelor of Arts in Psychology', 'Humanities', 'Bachelor', 3, 7, 41000, 51000,
 '{"aps_score": 33, "minimum_aps": 30, "subjects": [{"name": "English", "minimum_level": 5, "required": true}]}'::jsonb,
 ARRAY['Psychologist', 'HR Consultant', 'Organizational Development Specialist'],
 'Well-rounded psychology program with industrial and clinical pathways.'),

((SELECT id FROM universities WHERE university_code = 'up'), 'BSC_NURS', 'Bachelor of Science in Nursing', 'Health Sciences', 'Bachelor', 4, 8, 39000, 49000,
 '{"aps_score": 33, "minimum_aps": 30, "subjects": [{"name": "Life Sciences", "minimum_level": 5, "required": true}, {"name": "Mathematics", "minimum_level": 4, "required": true}]}'::jsonb,
 ARRAY['Registered Nurse', 'Community Health Nurse', 'Nurse Educator'],
 'SANC-accredited with strong community health focus and clinical placements.');

-- Stellenbosch Programs (abbreviated for space - 3 programs)
INSERT INTO university_programs (university_id, program_code, program_name, faculty, degree_type, duration_years, nqf_level, annual_tuition_min, annual_tuition_max, admission_requirements, career_outcomes) VALUES
((SELECT id FROM universities WHERE university_code = 'sun'), 'BSC_CS', 'Bachelor of Science in Computer Science', 'Science', 'Bachelor', 3, 7, 47000, 57000,
 '{"aps_score": 38, "minimum_aps": 35, "subjects": [{"name": "Mathematics", "minimum_level": 6, "required": true}]}'::jsonb,
 ARRAY['Software Developer', 'Data Scientist']),
((SELECT id FROM universities WHERE university_code = 'sun'), 'BCOM_ACC', 'Bachelor of Commerce in Accounting', 'Economic Sciences', 'Bachelor', 3, 7, 48000, 58000,
 '{"aps_score": 39, "minimum_aps": 37, "subjects": [{"name": "Mathematics", "minimum_level": 6, "required": true}]}'::jsonb,
 ARRAY['Chartered Accountant', 'Auditor']),
((SELECT id FROM universities WHERE university_code = 'sun'), 'BENG_MECH', 'Bachelor of Engineering in Mechanical Engineering', 'Engineering', 'Bachelor', 4, 8, 52000, 65000,
 '{"aps_score": 39, "minimum_aps": 37, "subjects": [{"name": "Mathematics", "minimum_level": 7, "required": true}, {"name": "Physical Science", "minimum_level": 6, "required": true}]}'::jsonb,
 ARRAY['Mechanical Engineer', 'Design Engineer']);

-- UJ Programs (3 programs)
INSERT INTO university_programs (university_id, program_code, program_name, faculty, degree_type, duration_years, nqf_level, annual_tuition_min, annual_tuition_max, admission_requirements, career_outcomes) VALUES
((SELECT id FROM universities WHERE university_code = 'uj'), 'BSC_CS', 'Bachelor of Science in Computer Science', 'Science', 'Bachelor', 3, 7, 42000, 52000,
 '{"aps_score": 34, "minimum_aps": 31, "subjects": [{"name": "Mathematics", "minimum_level": 5, "required": true}]}'::jsonb,
 ARRAY['Software Developer', 'IT Specialist']),
((SELECT id FROM universities WHERE university_code = 'uj'), 'BCOM_ACC', 'Bachelor of Commerce in Accounting', 'Management', 'Bachelor', 3, 7, 44000, 54000,
 '{"aps_score": 36, "minimum_aps": 34, "subjects": [{"name": "Mathematics", "minimum_level": 5, "required": true}]}'::jsonb,
 ARRAY['Accountant', 'Financial Manager']),
((SELECT id FROM universities WHERE university_code = 'uj'), 'BSC_NURS', 'Bachelor of Science in Nursing', 'Health Sciences', 'Bachelor', 4, 8, 38000, 48000,
 '{"aps_score": 32, "minimum_aps": 29, "subjects": [{"name": "Life Sciences", "minimum_level": 5, "required": true}]}'::jsonb,
 ARRAY['Registered Nurse', 'Clinical Nurse']);

-- DUT Programs (3 programs - more practical/tech focus)
INSERT INTO university_programs (university_id, program_code, program_name, faculty, degree_type, duration_years, nqf_level, annual_tuition_min, annual_tuition_max, admission_requirements, career_outcomes) VALUES
((SELECT id FROM universities WHERE university_code = 'dut'), 'BTECH_IT', 'Bachelor of Technology in Information Technology', 'Accounting & Informatics', 'Bachelor', 3, 7, 38000, 46000,
 '{"aps_score": 30, "minimum_aps": 28, "subjects": [{"name": "Mathematics", "minimum_level": 4, "required": true}]}'::jsonb,
 ARRAY['IT Technician', 'Systems Administrator', 'Web Developer']),
((SELECT id FROM universities WHERE university_code = 'dut'), 'NDIP_ENG', 'National Diploma in Engineering', 'Engineering', 'Diploma', 3, 6, 35000, 43000,
 '{"aps_score": 28, "minimum_aps": 26, "subjects": [{"name": "Mathematics", "minimum_level": 4, "required": true}, {"name": "Physical Science", "minimum_level": 4, "required": true}]}'::jsonb,
 ARRAY['Engineering Technician', 'Technologist']),
((SELECT id FROM universities WHERE university_code = 'dut'), 'NDIP_NURS', 'National Diploma in Nursing', 'Health Sciences', 'Diploma', 4, 6, 32000, 40000,
 '{"aps_score": 28, "minimum_aps": 26, "subjects": [{"name": "Life Sciences", "minimum_level": 4, "required": true}]}'::jsonb,
 ARRAY['Enrolled Nurse', 'Staff Nurse']);

-- Rhodes, NMU, UFH, NWU (2 programs each for brevity)
INSERT INTO university_programs (university_id, program_code, program_name, faculty, degree_type, duration_years, nqf_level, annual_tuition_min, annual_tuition_max, admission_requirements, career_outcomes) VALUES
((SELECT id FROM universities WHERE university_code = 'rhodes'), 'BSC_CS', 'Bachelor of Science in Computer Science', 'Science', 'Bachelor', 3, 7, 40000, 50000,
 '{"aps_score": 33, "minimum_aps": 30, "subjects": [{"name": "Mathematics", "minimum_level": 5, "required": true}]}'::jsonb,
 ARRAY['Software Developer', 'Data Analyst']),
((SELECT id FROM universities WHERE university_code = 'rhodes'), 'BA_PSYCH', 'Bachelor of Arts in Psychology', 'Humanities', 'Bachelor', 3, 7, 38000, 48000,
 '{"aps_score": 31, "minimum_aps": 28, "subjects": [{"name": "English", "minimum_level": 5, "required": true}]}'::jsonb,
 ARRAY['Psychologist', 'Counselor']),

((SELECT id FROM universities WHERE university_code = 'nmu'), 'BCOM_ACC', 'Bachelor of Commerce in Accounting', 'Business', 'Bachelor', 3, 7, 41000, 51000,
 '{"aps_score": 34, "minimum_aps": 32, "subjects": [{"name": "Mathematics", "minimum_level": 5, "required": true}]}'::jsonb,
 ARRAY['Accountant', 'Auditor']),
((SELECT id FROM universities WHERE university_code = 'nmu'), 'BSC_NURS', 'Bachelor of Science in Nursing', 'Health Sciences', 'Bachelor', 4, 8, 37000, 47000,
 '{"aps_score": 31, "minimum_aps": 28, "subjects": [{"name": "Life Sciences", "minimum_level": 4, "required": true}]}'::jsonb,
 ARRAY['Registered Nurse']),

((SELECT id FROM universities WHERE university_code = 'ufh'), 'BA_EDUC', 'Bachelor of Arts in Education', 'Education', 'Bachelor', 4, 7, 35000, 43000,
 '{"aps_score": 28, "minimum_aps": 26, "subjects": [{"name": "English", "minimum_level": 4, "required": true}]}'::jsonb,
 ARRAY['High School Teacher', 'Education Specialist']),
((SELECT id FROM universities WHERE university_code = 'ufh'), 'BSC_AGRIC', 'Bachelor of Science in Agriculture', 'Science', 'Bachelor', 3, 7, 36000, 44000,
 '{"aps_score": 29, "minimum_aps": 27, "subjects": [{"name": "Life Sciences", "minimum_level": 4, "required": true}]}'::jsonb,
 ARRAY['Agricultural Scientist', 'Farm Manager']),

((SELECT id FROM universities WHERE university_code = 'nwu'), 'BCOM_ACC', 'Bachelor of Commerce in Accounting', 'Economic Sciences', 'Bachelor', 3, 7, 42000, 52000,
 '{"aps_score": 35, "minimum_aps": 33, "subjects": [{"name": "Mathematics", "minimum_level": 5, "required": true}]}'::jsonb,
 ARRAY['Chartered Accountant', 'Financial Analyst']),
((SELECT id FROM universities WHERE university_code = 'nwu'), 'BA_LAW', 'Bachelor of Arts in Law (LLB)', 'Law', 'Bachelor', 4, 8, 43000, 53000,
 '{"aps_score": 34, "minimum_aps": 32, "subjects": [{"name": "English", "minimum_level": 5, "required": true}]}'::jsonb,
 ARRAY['Lawyer', 'Legal Advisor', 'Advocate']);


-- ============================================================================
-- MODULE 2: BURSARIES (10 major SA bursaries)
-- ============================================================================

INSERT INTO bursaries (bursary_code, bursary_name, provider_name, provider_type, bursary_type, amount_description, amount_min, amount_max, fields_of_study, target_demographics, eligibility_criteria, application_deadline, application_opens, application_url, contact_info, work_back_required, work_back_years, renewable) VALUES

('sasol_eng', 'Sasol Engineering Bursary', 'Sasol', 'corporate', 'full', 'Full tuition + R5,000/month stipend + accommodation + textbooks', 80000, 120000,
 ARRAY['engineering', 'science', 'technology'],
 '{"race": ["Black", "Coloured", "Indian"], "gender": "any", "province": "any"}'::jsonb,
 '{"academic": {"minimum_average": 70, "required_subjects": ["Mathematics", "Physical Science"], "minimum_subject_level": 5}, "financial": {"household_income_max": 600000, "means_test_required": true}, "other": {"sa_citizen": true, "age_max": 25, "first_time_student": false}}'::jsonb,
 '2026-06-30', '2026-03-01', 'https://www.sasol.com/careers/bursaries',
 '{"email": "bursaries@sasol.com", "phone": "+27 11 441 3111"}'::jsonb,
 true, 2, true),

('fnb_tech', 'FNB Tech Talent Bursary', 'First National Bank', 'corporate', 'full', 'Full tuition + R4,500/month allowance + laptop', 70000, 100000,
 ARRAY['computer_science', 'information_technology', 'data_science', 'engineering'],
 '{"race": "any", "gender": "any", "province": "any"}'::jsonb,
 '{"academic": {"minimum_average": 65, "required_subjects": ["Mathematics"], "minimum_subject_level": 5}, "financial": {"household_income_max": 500000, "means_test_required": true}, "other": {"sa_citizen": true, "age_max": 30}}'::jsonb,
 '2026-08-31', '2026-04-01', 'https://www.fnb.co.za/about-fnb/careers/bursaries.html',
 '{"email": "bursaries@fnb.co.za", "phone": "+27 87 575 9404"}'::jsonb,
 true, 2, true),

('nedbank_scholar', 'Nedbank Scholarship Programme', 'Nedbank', 'corporate', 'full', 'Full tuition + R60,000 annual allowance', 90000, 130000,
 ARRAY['commerce', 'finance', 'accounting', 'economics', 'actuarial_science'],
 '{"race": ["Black", "Coloured", "Indian"], "gender": "any", "province": "any"}'::jsonb,
 '{"academic": {"minimum_average": 75, "required_subjects": ["Mathematics"], "minimum_subject_level": 6}, "financial": {"household_income_max": 700000, "means_test_required": true}, "other": {"sa_citizen": true, "age_max": 25}}'::jsonb,
 '2026-07-31', '2026-03-15', 'https://www.nedbank.co.za/content/nedbank/desktop/gt/en/aboutus/nedbank-bursaries.html',
 '{"email": "bursaries@nedbank.co.za", "phone": "+27 11 294 4444"}'::jsonb,
 true, 3, true),

('discovery_found', 'Discovery Foundation Bursary', 'Discovery', 'corporate', 'full', 'Full tuition + R5,500/month + medical aid', 85000, 115000,
 ARRAY['medicine', 'health_sciences', 'actuarial_science', 'data_science'],
 '{"race": "any", "gender": "any", "province": "any"}'::jsonb,
 '{"academic": {"minimum_average": 75, "required_subjects": ["Mathematics", "Life Sciences"], "minimum_subject_level": 6}, "financial": {"household_income_max": 600000, "means_test_required": true}, "other": {"sa_citizen": true, "age_max": 25}}'::jsonb,
 '2026-06-30', '2026-02-01', 'https://www.discovery.co.za/corporate/bursaries',
 '{"email": "bursaries@discovery.co.za", "phone": "+27 11 529 2888"}'::jsonb,
 true, 2, true),

('anglo_american', 'Anglo American Bursary', 'Anglo American', 'corporate', 'full', 'Full tuition + R6,000/month + vacation work', 95000, 135000,
 ARRAY['engineering', 'mining', 'geology', 'metallurgy'],
 '{"race": ["Black", "Coloured", "Indian"], "gender": "any", "province": "any"}'::jsonb,
 '{"academic": {"minimum_average": 70, "required_subjects": ["Mathematics", "Physical Science"], "minimum_subject_level": 6}, "financial": {"household_income_max": 800000, "means_test_required": true}, "other": {"sa_citizen": true, "age_max": 26}}'::jsonb,
 '2026-07-15', '2026-03-01', 'https://www.angloamerican.com/careers/bursaries',
 '{"email": "bursaries@angloamerican.com", "phone": "+27 11 638 9111"}'::jsonb,
 true, 3, true),

('eskom_eng', 'Eskom Engineering Bursary', 'Eskom', 'state_owned', 'full', 'Full tuition + R4,000/month + vacation work', 75000, 105000,
 ARRAY['electrical_engineering', 'mechanical_engineering', 'civil_engineering'],
 '{"race": "any", "gender": "any", "province": "any"}'::jsonb,
 '{"academic": {"minimum_average": 65, "required_subjects": ["Mathematics", "Physical Science"], "minimum_subject_level": 5}, "financial": {"household_income_max": 500000, "means_test_required": true}, "other": {"sa_citizen": true, "age_max": 28}}'::jsonb,
 '2026-08-31', '2026-04-01', 'https://www.eskom.co.za/careers/bursaries',
 '{"email": "bursaries@eskom.co.za", "phone": "+27 11 800 8111"}'::jsonb,
 true, 3, true),

('transnet_burs', 'Transnet Bursary Scheme', 'Transnet', 'state_owned', 'full', 'Full tuition + R3,500/month + transport allowance', 70000, 95000,
 ARRAY['engineering', 'logistics', 'supply_chain', 'transport_management'],
 '{"race": ["Black", "Coloured", "Indian"], "gender": "any", "province": "any"}'::jsonb,
 '{"academic": {"minimum_average": 60, "required_subjects": ["Mathematics"], "minimum_subject_level": 4}, "financial": {"household_income_max": 450000, "means_test_required": true}, "other": {"sa_citizen": true, "age_max": 30}}'::jsonb,
 '2026-09-30', '2026-05-01', 'https://www.transnet.net/careers/bursaries',
 '{"email": "bursaries@transnet.net", "phone": "+27 11 584 0000"}'::jsonb,
 true, 2, true),

('dbe_teacher', 'Department of Basic Education Teacher Bursary (Funza Lushaka)', 'Department of Basic Education', 'government', 'full', 'Full tuition + R27,000 annual allowance + registration fees', 55000, 75000,
 ARRAY['education', 'teaching'],
 '{"race": "any", "gender": "any", "province": "any"}'::jsonb,
 '{"academic": {"minimum_average": 60, "required_subjects": ["English"], "minimum_subject_level": 4}, "financial": {"household_income_max": 600000, "means_test_required": false}, "other": {"sa_citizen": true, "age_max": 35, "commit_to_teaching": true}}'::jsonb,
 '2026-11-30', '2026-08-01', 'https://www.funzalushaka.doe.gov.za',
 '{"email": "info@funzalushaka.doe.gov.za", "phone": "+27 800 202 933"}'::jsonb,
 true, 1, true),

('nsfas_univ', 'NSFAS University Bursary', 'National Student Financial Aid Scheme', 'government', 'full', 'Full tuition + accommodation + meals + books + transport allowance', 60000, 90000,
 ARRAY['all_fields'],
 '{"race": "any", "gender": "any", "province": "any"}'::jsonb,
 '{"academic": {"minimum_average": 50, "required_subjects": [], "minimum_subject_level": 0}, "financial": {"household_income_max": 350000, "means_test_required": true}, "other": {"sa_citizen": true, "sassa_recipient_priority": true}}'::jsonb,
 '2026-11-30', '2026-10-01', 'https://www.nsfas.org.za',
 '{"email": "info@nsfas.org.za", "phone": "+27 800 067 327"}'::jsonb,
 false, 0, true),

('stanbic_tutuwa', 'Standard Bank Tutuwa Bursary', 'Standard Bank', 'corporate', 'full', 'Full tuition + R4,000/month + vacation work + mentorship', 75000, 105000,
 ARRAY['commerce', 'finance', 'accounting', 'economics', 'information_technology'],
 '{"race": ["Black"], "gender": "any", "province": "any"}'::jsonb,
 '{"academic": {"minimum_average": 70, "required_subjects": ["Mathematics"], "minimum_subject_level": 5}, "financial": {"household_income_max": 550000, "means_test_required": true}, "other": {"sa_citizen": true, "age_max": 25, "leadership_potential": true}}'::jsonb,
 '2026-07-31', '2026-03-01', 'https://www.standardbank.co.za/southafrica/personal/about-us/corporate-citizenship/education/tutuwa-bursary-fund',
 '{"email": "tutuwa@standardbank.co.za", "phone": "+27 11 636 9111"}'::jsonb,
 true, 2, true);


-- ============================================================================
-- MODULE 3: CAREERS DATABASE (10 diverse careers)
-- ============================================================================

INSERT INTO careers (career_code, career_title, career_category, career_subcategory, short_description, detailed_description, typical_tasks, work_environment, required_education, required_qualifications, required_subjects, alternative_pathways, salary_entry_min, salary_entry_max, salary_mid_min, salary_mid_max, salary_senior_min, salary_senior_max, job_outlook, growth_rate_percentage, demand_level, skills_required, personality_traits, related_careers, typical_employers, sa_specific_info) VALUES

('data_scientist', 'Data Scientist', 'Technology', 'Data & Analytics', 'Analyzes complex data to help organizations make better decisions using statistics, machine learning, and programming.', 'Data scientists extract insights from large datasets using statistical analysis, machine learning algorithms, and data visualization. They work with business stakeholders to solve problems and drive strategic decisions.',
 ARRAY['Collect and clean large datasets', 'Build predictive models', 'Create data visualizations', 'Present findings to stakeholders', 'Develop machine learning algorithms'],
 'Office', 'Bachelor''s Degree', ARRAY['BSc Data Science', 'BSc Computer Science', 'BSc Statistics', 'BCom Analytics'],
 ARRAY['Mathematics', 'Physical Science'], ARRAY['Online bootcamps', 'Self-taught with portfolio', 'BCom with data analytics specialization'],
 25000, 45000, 45000, 80000, 70000, 150000, 'high_growth', 35.5, 'very_high',
 ARRAY['Python/R programming', 'Statistics', 'Machine learning', 'SQL', 'Data visualization', 'Communication'],
 ARRAY['Analytical', 'Problem-solver', 'Detail-oriented', 'Curious'],
 ARRAY['Data Analyst', 'Machine Learning Engineer', 'Business Intelligence Analyst'],
 ARRAY['Banks', 'Retailers', 'Tech companies', 'Consulting firms'],
 '{"sa_companies_hiring": ["Capitec", "Discovery", "Takealot", "Standard Bank", "Nedbank", "Old Mutual"], "critical_skill": true, "scarce_skill": true, "government_priority": true, "provincial_demand": {"gauteng": "very_high", "western_cape": "high", "kwazulu_natal": "medium"}, "unemployment_rate": 3.2, "notes": "Extremely high demand due to digital transformation. Companies struggle to find qualified candidates."}'::jsonb),

('software_developer', 'Software Developer', 'Technology', 'Software Engineering', 'Designs, codes, tests, and maintains software applications and systems for various platforms.', 'Software developers create applications for web, mobile, and desktop platforms. They write clean code, debug issues, and collaborate with teams to deliver software solutions.',
 ARRAY['Write and test code', 'Debug software issues', 'Collaborate with designers and product managers', 'Review code from peers', 'Deploy applications'],
 'Office', 'Bachelor''s Degree', ARRAY['BSc Computer Science', 'BCom Informatics', 'BTech Software Development'],
 ARRAY['Mathematics', 'Information Technology'], ARRAY['Coding bootcamps', 'Self-taught with portfolio', 'Online certifications'],
 18000, 35000, 35000, 65000, 60000, 120000, 'high_growth', 28.3, 'very_high',
 ARRAY['Programming (Java/Python/JavaScript)', 'Problem-solving', 'Version control (Git)', 'Databases', 'Agile methodologies'],
 ARRAY['Logical thinker', 'Patient', 'Team player', 'Continuous learner'],
 ARRAY['Full Stack Developer', 'Mobile App Developer', 'DevOps Engineer'],
 ARRAY['Tech startups', 'Banks', 'Retailers', 'Consulting firms'],
 '{"sa_companies_hiring": ["Takealot", "Mr D Food", "Yoco", "Investec", "Allan Gray", "Amazon Cape Town"], "critical_skill": true, "scarce_skill": true, "government_priority": true, "provincial_demand": {"gauteng": "very_high", "western_cape": "very_high", "kwazulu_natal": "high"}, "unemployment_rate": 4.1, "notes": "Strong demand across all sectors. Remote work opportunities increasing."}'::jsonb),

('registered_nurse', 'Registered Nurse', 'Healthcare', 'Nursing', 'Provides patient care, administers medication, and supports doctors in hospitals and clinics.', 'Registered nurses assess patient health, administer treatments, educate patients and families, and coordinate care across healthcare teams.',
 ARRAY['Assess patient conditions', 'Administer medications', 'Monitor vital signs', 'Educate patients', 'Maintain medical records'],
 'Hospital', 'Bachelor''s Degree', ARRAY['BSc Nursing', 'Diploma in Nursing'],
 ARRAY['Life Sciences', 'Mathematics'], ARRAY['Enrolled Nursing Assistant to RN bridge program'],
 15000, 28000, 28000, 45000, 45000, 70000, 'stable', 12.5, 'very_high',
 ARRAY['Patient care', 'Medical knowledge', 'Communication', 'Empathy', 'Time management', 'Critical thinking'],
 ARRAY['Compassionate', 'Resilient', 'Detail-oriented', 'Calm under pressure'],
 ARRAY['Nurse Practitioner', 'Clinical Nurse Specialist', 'Nurse Educator'],
 ARRAY['Public hospitals', 'Private hospitals', 'Clinics', 'Nursing homes'],
 '{"sa_companies_hiring": ["Netcare", "Life Healthcare", "Mediclinic", "Provincial Health Departments"], "critical_skill": true, "scarce_skill": true, "government_priority": true, "provincial_demand": {"gauteng": "very_high", "western_cape": "very_high", "kwazulu_natal": "very_high"}, "unemployment_rate": 8.5, "notes": "31,000+ vacant nursing positions in public sector. High demand but challenging working conditions."}'::jsonb),

('high_school_teacher', 'High School Teacher', 'Education', 'Teaching', 'Educates Grade 8-12 students in specific subjects, prepares lessons, and assesses student progress.', 'High school teachers develop curriculum, deliver engaging lessons, assess student work, and support learners in their academic and personal development.',
 ARRAY['Prepare lesson plans', 'Teach classes', 'Grade assignments and exams', 'Manage classroom behavior', 'Communicate with parents'],
 'School', 'Bachelor''s Degree', ARRAY['B.Ed', 'BA/BSc + PGCE'],
 ARRAY['English', 'Subject specialization'], ARRAY['Teaching diploma upgrade to degree'],
 18000, 28000, 28000, 42000, 42000, 65000, 'stable', 8.2, 'high',
 ARRAY['Subject expertise', 'Communication', 'Patience', 'Classroom management', 'Lesson planning'],
 ARRAY['Patient', 'Passionate', 'Organized', 'Empathetic'],
 ARRAY['School Principal', 'Education Specialist', 'Curriculum Developer'],
 ARRAY['Public schools', 'Private schools', 'Independent schools'],
 '{"sa_companies_hiring": ["Department of Basic Education", "Private school groups", "Independent schools"], "critical_skill": true, "scarce_skill": true, "government_priority": true, "provincial_demand": {"eastern_cape": "very_high", "limpopo": "very_high", "kwazulu_natal": "high"}, "unemployment_rate": 15.2, "notes": "Funza Lushaka bursary available. Math and Science teachers in highest demand."}'::jsonb),

('chartered_accountant', 'Chartered Accountant (CA)', 'Business & Finance', 'Accounting', 'Provides financial reporting, auditing, tax, and advisory services to organizations.', 'Chartered Accountants are qualified financial professionals who audit financial statements, provide tax advice, and help organizations with financial strategy and compliance.',
 ARRAY['Audit financial statements', 'Prepare tax returns', 'Provide financial advice', 'Ensure regulatory compliance', 'Analyze financial data'],
 'Office', 'Bachelor''s Degree', ARRAY['BCom Accounting', 'BCom Accounting Sciences'],
 ARRAY['Mathematics', 'Accounting'], ARRAY['BCom general to postgraduate accounting'],
 20000, 35000, 40000, 70000, 70000, 150000, 'stable', 6.5, 'high',
 ARRAY['Financial analysis', 'Auditing', 'Tax knowledge', 'Attention to detail', 'Ethics', 'Excel proficiency'],
 ARRAY['Analytical', 'Ethical', 'Detail-oriented', 'Trustworthy'],
 ARRAY['Financial Manager', 'Management Accountant', 'Tax Consultant'],
 ARRAY['Big 4 firms', 'Banks', 'Corporations', 'Government'],
 '{"sa_companies_hiring": ["PwC", "Deloitte", "KPMG", "EY", "BDO", "Mazars"], "critical_skill": false, "scarce_skill": false, "government_priority": false, "provincial_demand": {"gauteng": "high", "western_cape": "high", "kwazulu_natal": "medium"}, "unemployment_rate": 12.8, "notes": "Competitive field. CA(SA) qualification highly respected. 4-year training contract required."}'::jsonb),

('mechanical_engineer', 'Mechanical Engineer', 'Engineering', 'Mechanical Engineering', 'Designs, develops, and tests mechanical systems and devices for various industries.', 'Mechanical engineers work on everything from engines to HVAC systems, applying principles of physics and materials science to solve engineering problems.',
 ARRAY['Design mechanical systems', 'Create technical drawings', 'Test prototypes', 'Analyze system performance', 'Manage projects'],
 'Office', 'Bachelor''s Degree', ARRAY['BEng Mechanical Engineering', 'BSc Engineering (Mechanical)'],
 ARRAY['Mathematics', 'Physical Science'], ARRAY['Engineering technician to professional engineer'],
 18000, 32000, 35000, 60000, 60000, 110000, 'stable', 9.5, 'high',
 ARRAY['CAD software', 'Thermodynamics', 'Materials science', 'Problem-solving', 'Project management'],
 ARRAY['Analytical', 'Creative', 'Detail-oriented', 'Practical'],
 ARRAY['Design Engineer', 'Manufacturing Engineer', 'Project Engineer'],
 ARRAY['Manufacturing companies', 'Mining companies', 'Consulting firms'],
 '{"sa_companies_hiring": ["Sasol", "Eskom", "Transnet", "BMW South Africa", "Mercedes-Benz SA"], "critical_skill": true, "scarce_skill": true, "government_priority": true, "provincial_demand": {"gauteng": "high", "kwazulu_natal": "high", "western_cape": "medium"}, "unemployment_rate": 18.5, "notes": "ECSA registration required. Renewable energy sector creating new opportunities."}'::jsonb);


-- Continue with remaining 4 careers
INSERT INTO careers (career_code, career_title, career_category, career_subcategory, short_description, required_education, required_qualifications, required_subjects, salary_entry_min, salary_entry_max, salary_mid_min, salary_mid_max, salary_senior_min, salary_senior_max, job_outlook, demand_level, skills_required, sa_specific_info) VALUES

('medical_doctor', 'Medical Doctor', 'Healthcare', 'Medicine', 'Diagnoses and treats illnesses, injuries, and medical conditions in patients.', 'Medical Degree', ARRAY['MBChB', 'MBBS'],
 ARRAY['Mathematics', 'Physical Science', 'Life Sciences'], 25000, 40000, 50000, 90000, 90000, 200000, 'stable', 'very_high',
 ARRAY['Medical knowledge', 'Diagnosis', 'Patient care', 'Decision-making', 'Empathy', 'Stress management'],
 '{"sa_companies_hiring": ["Public hospitals", "Private hospitals", "Mediclinic", "Netcare", "Life Healthcare"], "critical_skill": true, "scarce_skill": true, "government_priority": true, "provincial_demand": {"all": "very_high"}, "unemployment_rate": 5.2, "notes": "6-year degree + 2-year internship. Rural areas have critical shortages."}'::jsonb),

('physiotherapist', 'Physiotherapist', 'Healthcare', 'Allied Health', 'Helps patients recover from injuries and manage chronic conditions through physical therapy and rehabilitation.', 'Bachelor''s Degree', ARRAY['BSc Physiotherapy'],
 ARRAY['Life Sciences', 'Physical Science'], 20000, 35000, 35000, 55000, 55000, 85000, 'high_growth', 'high',
 ARRAY['Anatomy knowledge', 'Manual therapy', 'Patient assessment', 'Exercise prescription', 'Communication'],
 '{"sa_companies_hiring": ["Private practices", "Hospitals", "Sports teams", "Rehabilitation centers"], "critical_skill": true, "scarce_skill": true, "government_priority": false, "provincial_demand": {"gauteng": "high", "western_cape": "high"}, "unemployment_rate": 12.5, "notes": "Growing demand due to sports medicine and aging population."}'::jsonb),

('corporate_lawyer', 'Corporate Lawyer', 'Legal', 'Corporate Law', 'Advises companies on legal matters including contracts, mergers, compliance, and corporate governance.', 'Law Degree', ARRAY['LLB', 'BA LLB'],
 ARRAY['English'], 22000, 40000, 45000, 85000, 85000, 180000, 'stable', 'medium',
 ARRAY['Legal research', 'Contract drafting', 'Negotiation', 'Analytical thinking', 'Communication'],
 '{"sa_companies_hiring": ["Law firms", "Banks", "Corporations", "Government"], "critical_skill": false, "scarce_skill": false, "government_priority": false, "provincial_demand": {"gauteng": "high", "western_cape": "medium"}, "unemployment_rate": 22.5, "notes": "Competitive field. Articles required. Top firms pay significantly more."}'::jsonb),

('social_entrepreneur', 'Social Entrepreneur', 'Business & Social Impact', 'Entrepreneurship', 'Creates and runs businesses that address social problems while generating sustainable income.', 'Various', ARRAY['BCom', 'BA Social Sciences', 'No formal requirement'],
 ARRAY['None specific'], 15000, 30000, 30000, 60000, 60000, 150000, 'high_growth', 'medium',
 ARRAY['Business planning', 'Social impact measurement', 'Fundraising', 'Leadership', 'Innovation', 'Networking'],
 '{"sa_companies_hiring": ["NGOs", "Social enterprises", "Impact investors", "Self-employed"], "critical_skill": false, "scarce_skill": false, "government_priority": true, "provincial_demand": {"all": "medium"}, "unemployment_rate": 35.0, "notes": "High risk but high impact. Government support through NYDA and SEDA."}'::jsonb);


-- ============================================================================
-- MODULE 6: SUBJECT-CAREER MAPPINGS (Matric subjects to careers)
-- ============================================================================

INSERT INTO subject_career_mappings (subject_name, subject_level, career_code, importance_level, minimum_mark_percentage, alternative_subjects, notes) VALUES
-- Data Scientist mappings
('Mathematics', 'HL', 'data_scientist', 'essential', 70, NULL, 'Strong math foundation critical for statistics and algorithms'),
('Physical Science', 'HL', 'data_scientist', 'highly_recommended', 60, ARRAY['Information Technology'], 'Helps with logical thinking and problem-solving'),
('Information Technology', 'HL', 'data_scientist', 'recommended', 60, NULL, 'Provides early exposure to programming concepts'),

-- Software Developer mappings
('Mathematics', 'HL', 'software_developer', 'essential', 60, NULL, 'Required for most CS degrees and logical problem-solving'),
('Information Technology', 'HL', 'software_developer', 'highly_recommended', 60, NULL, 'Direct exposure to programming and systems'),
('Physical Science', 'HL', 'software_developer', 'recommended', 55, NULL, 'Develops analytical and problem-solving skills'),

-- Registered Nurse mappings
('Life Sciences', 'HL', 'registered_nurse', 'essential', 60, NULL, 'Foundation for anatomy, physiology, and biology'),
('Mathematics', 'HL', 'registered_nurse', 'essential', 50, ARRAY['Mathematical Literacy'], 'Needed for medication calculations and statistics'),
('Physical Science', 'HL', 'registered_nurse', 'recommended', 50, NULL, 'Helps with understanding chemistry and pharmacology'),

-- High School Teacher mappings
('English', 'HL', 'high_school_teacher', 'essential', 60, NULL, 'Communication skills essential for teaching'),
('Mathematics', 'HL', 'high_school_teacher', 'highly_recommended', 60, NULL, 'If teaching math or science subjects'),
('Life Sciences', 'HL', 'high_school_teacher', 'recommended', 55, NULL, 'If teaching life sciences'),

-- Chartered Accountant mappings
('Mathematics', 'HL', 'chartered_accountant', 'essential', 70, NULL, 'Critical for accounting, finance, and auditing'),
('Accounting', 'HL', 'chartered_accountant', 'highly_recommended', 65, NULL, 'Provides foundation in financial accounting'),
('English', 'HL', 'chartered_accountant', 'highly_recommended', 60, NULL, 'Essential for report writing and communication'),

-- Mechanical Engineer mappings
('Mathematics', 'HL', 'mechanical_engineer', 'essential', 70, NULL, 'Core requirement for all engineering calculations'),
('Physical Science', 'HL', 'mechanical_engineer', 'essential', 65, NULL, 'Physics principles fundamental to mechanical engineering'),
('Engineering Graphics & Design', 'HL', 'mechanical_engineer', 'recommended', 60, NULL, 'Helpful for technical drawing and design'),

-- Medical Doctor mappings
('Life Sciences', 'HL', 'medical_doctor', 'essential', 75, NULL, 'Foundation for anatomy, physiology, and biology'),
('Physical Science', 'HL', 'medical_doctor', 'essential', 70, NULL, 'Chemistry critical for pharmacology and biochemistry'),
('Mathematics', 'HL', 'medical_doctor', 'essential', 70, NULL, 'Required for medical school admission'),

-- Physiotherapist mappings
('Life Sciences', 'HL', 'physiotherapist', 'essential', 65, NULL, 'Understanding of human anatomy and physiology'),
('Physical Science', 'HL', 'physiotherapist', 'highly_recommended', 60, NULL, 'Physics principles apply to biomechanics'),
('Mathematics', 'HL', 'physiotherapist', 'recommended', 55, ARRAY['Mathematical Literacy'], 'Basic calculations and statistics'),

-- Corporate Lawyer mappings
('English', 'HL', 'corporate_lawyer', 'essential', 70, NULL, 'Critical for legal writing and argumentation'),
('History', 'HL', 'corporate_lawyer', 'recommended', 60, ARRAY['Geography'], 'Develops analytical and essay-writing skills'),
('Accounting', 'HL', 'corporate_lawyer', 'recommended', 60, NULL, 'Useful for corporate and commercial law'),

-- Social Entrepreneur mappings
('Business Studies', 'HL', 'social_entrepreneur', 'highly_recommended', 60, ARRAY['Economics'], 'Business fundamentals and planning'),
('English', 'HL', 'social_entrepreneur', 'highly_recommended', 60, NULL, 'Communication and proposal writing'),
('Mathematics', 'HL', 'social_entrepreneur', 'recommended', 50, ARRAY['Mathematical Literacy'], 'Financial management and budgeting');


-- ============================================================================
-- MODULE 7: EMERGING CAREERS (4IR & Future of Work)
-- ============================================================================

INSERT INTO emerging_careers (career_code, career_title, emergence_year, technology_category, disruption_level, maturity_stage, sa_adoption_level, short_description, skills_required, traditional_career_equivalent, education_pathways, salary_range_description, salary_entry_min, salary_entry_max, growth_projection_5yr, sa_companies_hiring, government_initiatives, learning_resources, related_emerging_careers, automation_risk) VALUES

('ai_ml_engineer', 'AI/Machine Learning Engineer', 2018, 'AI/ML', 'transformative', 'growing', 'growing', 'Develops artificial intelligence systems and machine learning models that enable computers to learn and make decisions.', 
 ARRAY['Python', 'TensorFlow/PyTorch', 'Deep learning', 'Neural networks', 'Statistics', 'Cloud platforms'],
 'Software Developer', ARRAY['BSc Computer Science + AI specialization', 'BSc Data Science', 'Online AI bootcamps', 'Self-taught with portfolio'],
 'Entry: R30K-R60K/month, Mid: R60K-R120K/month, Senior: R120K-R250K/month', 30000, 60000,
 'Expected to grow 45% by 2030 as AI adoption accelerates across all sectors',
 ARRAY['Amazon Cape Town', 'Takealot', 'Discovery', 'Capitec', 'Standard Bank', 'AI startups'],
 ARRAY['DHET-Microsoft AI Skills Initiative', 'Presidential Commission on 4IR', 'AI Institute of South Africa'],
 ARRAY['Coursera AI courses', 'Fast.ai', 'DeepLearning.AI', 'Google AI courses'],
 ARRAY['Data Scientist', 'Computer Vision Engineer', 'NLP Specialist'],
 'low'),

('renewable_energy_specialist', 'Renewable Energy Specialist', 2019, 'Green Energy', 'transformative', 'growing', 'mainstream', 'Designs, installs, and maintains solar, wind, and other renewable energy systems to address load shedding and climate change.',
 ARRAY['Solar PV systems', 'Electrical engineering', 'Energy storage', 'Grid integration', 'Project management'],
 'Electrical Engineer', ARRAY['BEng Electrical Engineering (Renewable focus)', 'BTech Renewable Energy', 'TVET electrical + solar certification'],
 'Entry: R20K-R40K/month, Mid: R40K-R75K/month, Senior: R75K-R150K/month', 20000, 40000,
 'Expected to grow 60% by 2030 driven by Just Energy Transition and load shedding solutions',
 ARRAY['Eskom', 'Solar companies', 'Energy consulting firms', 'Mining companies', 'Municipalities'],
 ARRAY['Just Energy Transition plan', 'Renewable Energy IPP Programme', 'Green Skills Initiative'],
 ARRAY['SESSA training', 'GreenCape courses', 'Solar PV installer certification'],
 ARRAY['Energy Consultant', 'Solar Installer', 'Grid Engineer'],
 'low'),

('cybersecurity_analyst', 'Cybersecurity Analyst', 2017, 'Cybersecurity', 'high', 'established', 'growing', 'Protects organizations from cyber threats by monitoring systems, detecting vulnerabilities, and responding to security incidents.',
 ARRAY['Network security', 'Ethical hacking', 'Security tools (SIEM)', 'Incident response', 'Risk assessment', 'Compliance'],
 'IT Security Specialist', ARRAY['BSc Computer Science + Security specialization', 'BCom Informatics', 'CompTIA Security+', 'Certified Ethical Hacker (CEH)'],
 'Entry: R25K-R45K/month, Mid: R45K-R85K/month, Senior: R85K-R180K/month', 25000, 45000,
 'Expected to grow 38% by 2030 as cyber attacks increase and POPIA compliance required',
 ARRAY['Banks', 'Telcos', 'Government', 'Consulting firms', 'Retailers'],
 ARRAY['National Cybersecurity Policy Framework', 'POPIA compliance requirements'],
 ARRAY['TryHackMe', 'HackTheBox', 'Cybrary', 'SANS courses'],
 ARRAY['Penetration Tester', 'Security Architect', 'SOC Analyst'],
 'low'),

('data_analyst', 'Data Analyst', 2016, 'Data Analytics', 'high', 'established', 'mainstream', 'Collects, processes, and analyzes data to help organizations make informed business decisions.',
 ARRAY['Excel', 'SQL', 'Power BI/Tableau', 'Statistics', 'Data visualization', 'Business intelligence'],
 'Business Analyst', ARRAY['BCom Analytics', 'BSc Statistics', 'BCom Informatics', 'Online data analytics bootcamps'],
 'Entry: R18K-R35K/month, Mid: R35K-R60K/month, Senior: R60K-R100K/month', 18000, 35000,
 'Expected to grow 32% by 2030 as data-driven decision making becomes standard',
 ARRAY['Banks', 'Retailers', 'Consulting firms', 'Insurance companies', 'Government'],
 ARRAY['Data Science for Social Impact initiative', 'Stats SA data skills programs'],
 ARRAY['Google Data Analytics Certificate', 'Microsoft Power BI courses', 'DataCamp'],
 ARRAY['Business Intelligence Analyst', 'Data Scientist', 'Analytics Consultant'],
 'medium'),

('ux_ui_designer', 'UX/UI Designer', 2015, 'Digital Design', 'high', 'established', 'mainstream', 'Designs user-friendly interfaces and experiences for websites, apps, and digital products.',
 ARRAY['Figma/Adobe XD', 'User research', 'Wireframing', 'Prototyping', 'Visual design', 'Usability testing'],
 'Graphic Designer', ARRAY['Interaction Design degree', 'Visual Communication', 'UX bootcamps', 'Self-taught with portfolio'],
 'Entry: R18K-R35K/month, Mid: R35K-R65K/month, Senior: R65K-R120K/month', 18000, 35000,
 'Expected to grow 25% by 2030 as digital products become more sophisticated',
 ARRAY['Tech startups', 'Banks', 'Retailers', 'Agencies', 'Consulting firms'],
 ARRAY['Digital skills initiatives', 'Tech entrepreneurship programs'],
 ARRAY['Google UX Design Certificate', 'Interaction Design Foundation', 'Udemy courses'],
 ARRAY['Product Designer', 'Service Designer', 'UX Researcher'],
 'medium'),

('digital_marketing_specialist', 'Digital Marketing Specialist', 2014, 'Digital Marketing', 'high', 'established', 'mainstream', 'Promotes brands and products through digital channels including social media, SEO, email, and online advertising.',
 ARRAY['Social media marketing', 'SEO/SEM', 'Google Ads', 'Content creation', 'Analytics', 'Email marketing'],
 'Marketing Manager', ARRAY['BCom Marketing', 'BA Media Studies', 'Google Digital Marketing Certificate', 'Self-taught'],
 'Entry: R12K-R25K/month, Mid: R25K-R50K/month, Senior: R50K-R100K/month', 12000, 25000,
 'Expected to grow 28% by 2030 as businesses shift to digital-first strategies',
 ARRAY['Agencies', 'Retailers', 'Startups', 'Media companies', 'All sectors'],
 ARRAY['Digital skills programs', 'SMME digital transformation support'],
 ARRAY['Google Digital Garage', 'HubSpot Academy', 'Meta Blueprint'],
 ARRAY['Social Media Manager', 'Content Strategist', 'Growth Marketer'],
 'medium'),

-- Continue with remaining 4 emerging careers (with all required fields)
('cloud_solutions_architect', 'Cloud Solutions Architect', 2017, 'Cloud Computing', 'high', 'growing', 'growing', 'Designs and implements cloud infrastructure solutions using AWS, Azure, or Google Cloud platforms.',
 ARRAY['AWS/Azure/GCP', 'Cloud architecture', 'DevOps', 'Security', 'Networking', 'Infrastructure as Code'],
 'Systems Administrator', ARRAY['BSc Computer Science', 'BCom Informatics', 'Cloud certifications (AWS/Azure)', 'Self-taught with certs'],
 'Entry: R28K-R55K/month, Mid: R55K-R100K/month, Senior: R100K-R200K/month', 28000, 55000,
 'Expected to grow 42% by 2030 as cloud adoption accelerates',
 ARRAY['Banks', 'Consulting firms', 'Tech companies', 'Retailers', 'Government'],
 ARRAY['Cloud computing skills programs', 'AWS/Azure training initiatives'],
 ARRAY['AWS Training', 'Azure Learn', 'Google Cloud Skills Boost', 'A Cloud Guru'],
 ARRAY['DevOps Engineer', 'Site Reliability Engineer', 'Infrastructure Engineer'],
 'low'),

('robotics_engineer', 'Robotics Engineer', 2019, 'Robotics & Automation', 'transformative', 'early', 'early', 'Designs, builds, and programs robots for manufacturing, healthcare, and other applications.',
 ARRAY['Robotics programming', 'Mechanical design', 'Electronics', 'AI/ML', 'Control systems', 'CAD'],
 'Mechanical Engineer', ARRAY['BEng Mechatronics', 'BEng Electrical + Robotics specialization', 'Online robotics courses'],
 'Entry: R25K-R50K/month, Mid: R50K-R90K/month, Senior: R90K-R160K/month', 25000, 50000,
 'Expected to grow 35% by 2030 in manufacturing and logistics automation',
 ARRAY['Manufacturing companies', 'Mining companies', 'Research institutions', 'Startups'],
 ARRAY['4IR manufacturing initiatives', 'Robotics research programs'],
 ARRAY['ROS tutorials', 'Udacity Robotics', 'Coursera Robotics courses'],
 ARRAY['Automation Engineer', 'Mechatronics Engineer', 'Control Systems Engineer'],
 'low'),

('sustainability_consultant', 'Sustainability Consultant', 2018, 'Sustainability & ESG', 'high', 'growing', 'growing', 'Advises organizations on environmental sustainability, ESG compliance, and climate change strategies.',
 ARRAY['ESG frameworks', 'Carbon accounting', 'Sustainability reporting', 'Stakeholder engagement', 'Project management'],
 'Environmental Consultant', ARRAY['BSc Environmental Science', 'BCom Sustainability', 'MBA with sustainability focus', 'Certification programs'],
 'Entry: R20K-R40K/month, Mid: R40K-R70K/month, Senior: R70K-R130K/month', 20000, 40000,
 'Expected to grow 30% by 2030 driven by ESG regulations and climate commitments',
 ARRAY['Consulting firms', 'Mining companies', 'Banks', 'Retailers', 'NGOs'],
 ARRAY['Just Energy Transition', 'National Climate Change Response Policy', 'Green Economy initiatives'],
 ARRAY['GRI certification', 'SASB standards training', 'CDP courses'],
 ARRAY['ESG Analyst', 'Climate Change Consultant', 'Corporate Social Responsibility Manager'],
 'low'),

('blockchain_developer', 'Blockchain Developer', 2017, 'Blockchain & Web3', 'transformative', 'early', 'early', 'Develops decentralized applications and smart contracts using blockchain technology.',
 ARRAY['Solidity', 'Ethereum', 'Smart contracts', 'Cryptography', 'Web3.js', 'Distributed systems'],
 'Software Developer', ARRAY['BSc Computer Science', 'Self-taught with portfolio', 'Blockchain bootcamps', 'Online certifications'],
 'Entry: R30K-R60K/month, Mid: R60K-R110K/month, Senior: R110K-R220K/month', 30000, 60000,
 'Expected to grow 40% by 2030 as blockchain adoption increases in finance and supply chain',
 ARRAY['Fintech startups', 'Banks', 'Consulting firms', 'Crypto companies'],
 ARRAY['Fintech innovation programs', 'Blockchain research initiatives'],
 ARRAY['Ethereum.org tutorials', 'Consensys Academy', 'Blockchain Council certifications'],
 ARRAY['Smart Contract Developer', 'DeFi Developer', 'Web3 Engineer'],
 'low');


-- ============================================================================
-- TEST QUESTIONS (20 questions from PRD for RAG quality testing)
-- ============================================================================

INSERT INTO test_questions (question_id, category, question_text, ideal_answer, key_points, required_modules) VALUES

('Q1', 'subject_career_matching', 'I''m good at math but hate physics. What should I study?',
 'Great question! Many students think engineering is the only math-heavy career, but physics is a core requirement there. Consider these alternatives: 1) Data Science/Analytics - uses statistics, linear algebra, coding, no physics needed. Strong SA demand (Capitec, Discovery, banks). Study BSc Data Science at UCT/Wits/Stellenbosch. 2) Actuarial Science - math-focused, well-paid (R40K-R80K entry), no physics. Study BCom Actuarial Science at UCT/UP/Stellenbosch. Competitive (need 80%+ math). 3) Economics/Econometrics - math modeling for policy/finance. Study BCom Economics at any university. 4) Computer Science - logic and algorithms, minimal physics. Study BSc/BCom Computer Science widely available. Next steps: Research these on SA Youth platform, check NSFAS eligibility.',
 ARRAY['Data Science as alternative', 'Actuarial Science option', 'Computer Science option', 'Economics option', 'No physics required', 'Salary information', 'Specific universities mentioned', 'Next steps provided'],
 ARRAY['careers', 'subject_career_mapping', 'sa_universities']),

('Q2', 'subject_career_matching', 'I love biology but don''t want to be a doctor. What else can I do?',
 'Medicine isn''t the only biology career! Here are high-growth options in South Africa: 1) Biotechnology - lab research on diseases, crops, biotech products. Study BSc Biotechnology at Stellenbosch/Wits. Bursaries: CSIR, NRF. 2) Environmental Science/Conservation - climate change, renewable energy, wildlife management. Study BSc Environmental Science at most universities. Jobs: WWF, SANBI, consulting firms. 3) Physiotherapy/Occupational Therapy - healthcare without 7-year medical degree. Study 4-year degree at UCT/Wits/UWC. High demand, R25K-R40K starting. 4) Pharmaceutical Science - drug development, pharmacy tech. Study BPharm (4 years) at any university. 5) Agricultural Science - food security, sustainable farming (4IR focus). Study BSc Agriculture at UP/Stellenbosch. Bursaries: Grain SA, AgriSETA. Pro tip: Life Sciences opens many doors beyond medicine.',
 ARRAY['Biotechnology option', 'Environmental Science option', 'Physiotherapy option', 'Pharmaceutical Science option', 'Agricultural Science option', 'Bursary information', 'Salary ranges', 'Study duration'],
 ARRAY['careers', 'subject_career_mapping', 'sa_universities', 'bursaries']),

('Q3', 'subject_career_matching', 'I''m creative but my parents want me to study something practical. What should I do?',
 'This is a common dilemma. The good news: creativity IS practical in the 4IR economy. Here are careers that blend both: 1) UX/UI Design - design apps, websites, user experiences. Tech companies pay R20K-R40K entry-level. Study Interaction Design at UJ/Vega, or learn online via Udemy + build portfolio. 2) Digital Marketing/Content Creation - social media, video, branding. Study BCom Marketing at any university. Freelance potential (side income). 3) Architecture - creative + technical. Study BArch at UCT/Wits/UP (5 years). Competitive (need math). 4) Industrial Design - design products (cars, furniture, tech). Study BTech Industrial Design at TUT/CPUT. 5) Game Design/Animation - growing SA industry. Study Digital Arts at Wits/UJ. How to persuade parents: Show them SA job market data—creative industries growing 15% annually. UX designers earn as much as engineers. Combine creativity with business skills (e.g., BCom Marketing) to prove practicality.',
 ARRAY['UX/UI Design option', 'Digital Marketing option', 'Architecture option', 'Industrial Design option', 'Game Design option', 'Salary information', 'Parent persuasion strategy', 'Growth statistics'],
 ARRAY['careers', '4ir_emerging_jobs', 'sa_universities']),

('Q4', 'subject_career_matching', 'I don''t have math in matric. Am I stuck with limited options?',
 'Not having Math doesn''t close all doors, but it does limit STEM fields (engineering, medicine, science). However, many great careers remain open: 1) Teaching (Humanities) - always in demand. Study B.Ed at any university. Bursaries: Funza Lushaka (full government bursary). 2) Law - strong analytical career. Study LLB at UCT/Wits/UP/UWC (5 years). No math required, but need 75%+ English. 3) Social Work - help communities, address social issues. Study BSocSc Social Work at most universities. Funded via NSFAS. 4) HR/Industrial Psychology - people management, corporate training. Study BCom HR or BA Psychology. 5) Journalism/Media - content creation, reporting. Study BA Journalism at Rhodes/Wits. 6) Business Admin - management, entrepreneurship. Study BCom Management at any university. Important: Some careers (e.g., accounting, actuarial science) require Math. If you change your mind, consider upgrading Math via UNISA or matric rewrite.',
 ARRAY['Teaching option', 'Law option', 'Social Work option', 'HR/Psychology option', 'Journalism option', 'Business Admin option', 'Funza Lushaka bursary', 'Math upgrade possibility'],
 ARRAY['careers', 'subject_career_mapping', 'sa_universities', 'bursaries']),

('Q5', 'subject_career_matching', 'I want to work in AI and technology. What should I study?',
 'AI is one of the fastest-growing fields in South Africa! Here''s your path: Undergraduate Degrees: 1) Computer Science (BSc/BCom): UCT, Wits, Stellenbosch, UP, Rhodes. Covers programming, algorithms, data structures. 3-4 years. 2) Data Science (BSc): UCT, Wits, UP. Focuses on statistics, machine learning, Python/R. 3 years. 3) Engineering (Electrical/Computer): UCT, Wits, Stellenbosch. 4 years. More hardware-focused. What to Study in High School: Math (essential—aim for 70%+), Physical Science (helpful but not always required), IT/CAT (optional, shows interest). Bursaries: Sasol (engineering/science) closes 30 June, FNB Tech Talent closes 31 August, Microsoft 4Afrika check DHET website, NSFAS if family earns < R350K/year. Career Outlook: Junior developers R15K-R30K/month, Mid-level AI engineers R40K-R80K/month, High demand at Capitec, Takealot, Discovery, startups. Next Steps: 1) Learn Python online (free: Codecademy, freeCodeCamp), 2) Build 1-2 small projects, 3) Apply to bursaries by mid-2026. SA is investing heavily in AI skills (DHET-Microsoft partnership).',
 ARRAY['Computer Science degree', 'Data Science degree', 'Engineering degree', 'High school subjects needed', 'Bursary options with deadlines', 'Salary ranges', 'SA companies hiring', 'Actionable next steps'],
 ARRAY['careers', '4ir_emerging_jobs', 'sa_universities', 'bursaries', 'subject_career_mapping']);


-- Financial Constraints questions (Q6-Q10)
INSERT INTO test_questions (question_id, category, question_text, ideal_answer, key_points, required_modules) VALUES

('Q6', 'financial_constraints', 'My family can''t afford university. What options do I have?',
 'There are multiple pathways even if university seems unaffordable: Option 1: NSFAS Funding - Government bursary for students from households earning < R350K/year. Covers tuition, accommodation, books, living allowance. Apply: nsfas.org.za (opens October yearly, closes November). 788,741 students funded in 2025. Option 2: TVET Colleges - Technical & Vocational Education & Training. Cheaper than university (R2K-R5K/year vs R40K-R60K). Practical skills: plumbing, electrical, IT, hospitality, business. 50 public TVET colleges nationwide. NSFAS also funds TVET. Option 3: Company-Sponsored Learnerships - Companies like Sasol, Eskom, Transnet offer "earn while you learn". Study + work simultaneously. No upfront fees, get stipend. Apply via SA Youth platform or company websites. Option 4: Corporate Bursaries - FNB, Nedbank, Discovery, mining companies offer full bursaries. Competitive (need 70%+ academic average). Usually require working for company 1-2 years after graduation. Action Plan: 1) Apply to NSFAS by 30 November 2025, 2) Research TVET colleges in your area, 3) Check SA Youth for learnerships, 4) Apply to 5+ corporate bursaries.',
 ARRAY['NSFAS option', 'TVET colleges option', 'Learnerships option', 'Corporate bursaries option', 'Income threshold R350K', 'Application deadlines', 'Specific numbers (788K students)', 'Action plan provided'],
 ARRAY['bursaries', 'nsfas', 'tvet_colleges', 'alternative_pathways']),

('Q7', 'financial_constraints', 'Should I choose the cheapest university or the "best" one?',
 'This depends on your career field and financial situation. When "Best" University Matters: 1) Law, Medicine, Engineering - Employers care about university reputation. UCT/Wits grads often get better internships. 2) Limited bursaries - Some corporate bursaries only fund students at top 5 universities. 3) Research careers - If you want PhD/academia, go to research-intensive universities. When "Best" Doesn''t Matter: 1) Teaching, Social Work, Nursing - All universities produce equally qualified graduates. Go local, save costs. 2) Business, Marketing, HR - Your skills + experience matter more than university name. 3) Technical skills (IT, design) - Employers care about portfolio/projects, not where you studied. Smart Strategy: If NSFAS funds you OR you have full bursary, choose best university you''re accepted to. If self-funding OR partial bursary, choose local university (save on accommodation = R40K-R60K/year). If studying business/tech, university brand less important, focus on internships + projects. Example: Studying BCom Accounting at UP vs UJ vs local university? All produce qualified CAs. Choose local, save R50K/year on accommodation. Studying Medicine? Go to UCT/Wits if accepted—better hospitals for training.',
 ARRAY['Field-specific advice', 'When reputation matters', 'When it doesn''t matter', 'Cost savings quantified', 'Accommodation costs', 'Strategic decision framework', 'Specific examples'],
 ARRAY['sa_universities', 'study_costs', 'careers']),

('Q8', 'financial_constraints', 'What are the hidden costs of university I should budget for?',
 'Great question—many students only budget for tuition and get surprised. Annual University Costs (2025 estimates): 1) Tuition: R40K-R60K/year (public universities), 2) Accommodation: On-campus residence R35K-R50K/year, Off-campus rental R30K-R45K/year, Living at home R0, 3) Meals: R20K-R30K/year (if not included in residence), 4) Books & Materials: R5K-R10K/year (varies by field—engineering more expensive), 5) Laptop: R8K-R15K (one-time, essential for most degrees), 6) Transport: R5K-R15K/year (if commuting), 7) Data & Internet: R3K-R5K/year, 8) Misc (printing, social, emergencies): R5K-R10K/year. Total Annual Cost: R80K-R150K/year (if living away from home), R50K-R80K/year (if living at home). What NSFAS Covers: Tuition (Full), Accommodation (Full if on-campus), Meals (R15K/year allowance), Books (R5K/year allowance), Transport (R7.5K/year allowance), Laptop (Once-off if first-time student). What NSFAS Doesn''t Cover: Off-campus rent (only covers on-campus), Personal expenses (clothes, entertainment), Data/internet for off-campus students. Budget Tips: 1) Choose university close to home if possible (save R30K-R50K/year), 2) Buy second-hand textbooks (save 50%), 3) Apply for multiple bursaries (NSFAS + corporate bursary = extra money), 4) Work part-time in 2nd-4th year.',
 ARRAY['Tuition costs', 'Accommodation costs', 'All hidden costs listed', 'Total cost breakdown', 'NSFAS coverage details', 'What NSFAS doesn''t cover', 'Budget tips', 'Savings strategies'],
 ARRAY['study_costs', 'nsfas', 'sa_universities']),

('Q9', 'financial_constraints', 'Is a TVET qualification "worth less" than a university degree?',
 'This is a myth that needs to die. The truth: it depends on your career goals. When TVET is BETTER than University: 1) Practical Skills Jobs - Plumbing, electrical work, welding, hospitality, beauty therapy, automotive—you''ll earn FASTER with TVET than a university degree in unrelated field. 2) Cost - TVET is 75% cheaper (R2K-R5K/year vs R40K-R60K). Less debt = more financial freedom. 3) Time to Employment - TVET = 2-3 years → immediate work. University = 3-4 years → still need internship. TVET grads often earn income 1-2 years earlier. 4) Demand - SA has critical skills shortages in trades (electricians earn R15K-R30K/month, experienced plumbers R25K-R40K). Government is pushing artisan training. When University is Better: 1) Professional Careers - Medicine, law, engineering, teaching (B.Ed required), accounting (CA route). 2) Research/Academia - Need PhD → need degree first. 3) Corporate Management - Large companies often require degrees for senior roles. Example Comparison: TVET Electrical (R10K total, 3 years, R15K/month starting, R30K+ at 5 years) vs University Engineering (R200K total, 4 years, R18K/month starting, R35K+ at 5 years). The Smart Move: TVET → Work → Save money → Study further later (many TVET diplomas count toward degrees). Bottom Line: TVET ≠ "second choice." It''s a smart, practical path for hands-on careers. SA needs 30,000 artisans by 2030.',
 ARRAY['TVET advantages', 'Cost comparison', 'Time to employment', 'Salary comparison', 'When university is better', 'Specific numbers', 'Career progression path', 'Government demand data'],
 ARRAY['tvet_colleges', 'study_costs', 'careers', 'alternative_pathways']),

('Q10', 'financial_constraints', 'Can I study part-time while working? How does that work?',
 'Yes! Part-time study is a smart strategy if you need income or can''t commit full-time. Part-Time Study Options: 1) UNISA (University of SA) - Fully distance learning. Study while working. Degrees take 5-6 years (vs 3-4 full-time). Fees: R20K-R35K/year. Self-discipline essential. 2) Private Colleges (Damelin, Boston, CTI) - Evening classes + weekend. BCom, IT, business diplomas. Fees: R25K-R40K/year. Flexible schedules. 3) Online Platforms (Coursera, Udemy, ALX) - Certifications (not degrees) in tech, data, business. R3K-R15K. Employers increasingly accept these. 4) University Part-Time Programs - Some universities offer evening BCom, BA, B.Ed. Check UCT, UJ, UP websites. Fees similar to full-time but spread over longer period. Pros: Earn income while studying, Gain work experience simultaneously, Less financial pressure, Can switch careers without quitting job. Cons: Takes 1.5-2x longer to graduate, Juggling work + study is exhausting, Miss campus life, NSFAS doesn''t fund part-time (only full-time). Realistic Schedule Example: Work 8am-5pm Monday-Friday, Study 6pm-10pm weeknights + Saturdays, Requires 20-25 hours/week for part-time degree. Who Should Do Part-Time: You need income NOW (family dependents, bills), You''re already working and want to upgrade skills, You tried full-time and struggled, You''re 25+ (older students often prefer part-time). Who Should NOT: Matric leavers 18-20 years old (go full-time, you have time), If NSFAS will fund you full-time (take the free option), If studying medicine/engineering (too intensive for part-time).',
 ARRAY['UNISA option', 'Private colleges option', 'Online platforms option', 'Pros and cons listed', 'Realistic schedule', 'Who should/shouldn''t', 'NSFAS doesn''t fund part-time', 'Cost information'],
 ARRAY['alternative_pathways', 'university_alternatives', 'sa_universities', 'nsfas']);


-- Career Misconceptions questions (Q11-Q15)
INSERT INTO test_questions (question_id, category, question_text, ideal_answer, key_points, required_modules) VALUES

('Q11', 'career_misconceptions', 'Do I need a degree to be successful?',
 'Short answer: No, but it depends on your definition of "success" and your career path. Careers That DON''T Require Degrees: 1) Trades (Electrician, Plumber, Welder) - TVET certificate → R15K-R40K/month. High demand. 2) Entrepreneurship - Start business with skills. Examples: catering, hair salon, car wash, online store. 3) Tech (Self-Taught) - Web development, graphic design, digital marketing. Learn online, build portfolio. Junior devs earn R15K-R25K/month. 4) Sales - Many sales roles train on the job. Top performers earn R20K-R50K/month (commission-based). 5) Creative (Photography, Videography, Music Production) - Portfolio matters more than paper. Careers That REQUIRE Degrees: 1) Professional (Doctor, Lawyer, Engineer, Teacher, Accountant) - Non-negotiable. Regulated by professional bodies. 2) Corporate Management - Most companies require degrees for management roles. 3) Government Jobs - Often require minimum qualifications. The Nuanced Truth: Without degree you can earn good money, but career ceiling may be lower. R40K/month possible, R80K+ harder. With degree opens more doors, higher salary ceiling (R50K-R100K+ at senior levels), but comes with debt/time cost. Bottom Line: You don''t NEED a degree to earn a living or be successful. But certain careers (medicine, law, engineering) absolutely require it. Choose based on your career goals, not pressure.',
 ARRAY['Careers without degrees', 'Careers requiring degrees', 'Salary comparisons', 'Career ceiling discussion', 'Balanced perspective', 'Specific examples', 'Success stories both ways'],
 ARRAY['careers', 'tvet_colleges', 'alternative_pathways', 'university_alternatives']),

('Q12', 'career_misconceptions', 'Is studying humanities/arts a waste of time?',
 'Absolutely not—but you need a plan. Humanities open doors if you combine them strategically. Where Humanities Graduates Thrive: 1) Communications/Marketing - BA + internships → R15K-R30K starting. Grow to R40K+ (copywriters, brand managers, PR). 2) HR/Industrial Psychology - BA Psychology → BCom HR postgrad → R18K-R35K starting. 3) Journalism/Media - BA Journalism + portfolio → R12K-R25K starting. 4) Social Work/NGO Sector - BA Social Work → R15K-R25K starting. Meaningful work. 5) Teaching - BA + PGCE (postgrad teaching diploma) → R18K-R28K starting. Stable, pensioned. 6) Law - BA → LLB (postgraduate law) → R20K-R40K starting (corporate law R50K+). 7) Policy/Research - BA + Honours/Masters → government, think tanks, R20K-R40K. The Catch: Humanities require YOU to build experience: Internships are critical (do 2-3 during degree), Build portfolio (write for student paper, start blog, volunteer), Network actively (LinkedIn, attend industry events), Consider postgrad (Honours/Masters often needed for good jobs). Smart Humanities Strategy: 1) Choose employable combination: BA Psychology + HR courses, BA + Marketing, BA Politics + Law, 2) Do internships every summer vacation, 3) Learn business skills (Excel, project management, basic finance), 4) Build online presence (LinkedIn articles, portfolio website). Bottom Line: Humanities aren''t a waste IF you''re strategic (internships, network, build portfolio). Without strategy, yes—it''s hard. But the same is true for any field.',
 ARRAY['Career paths listed', 'Salary ranges', 'Strategy required', 'Internships emphasized', 'Portfolio building', 'Postgrad options', 'Balanced pros/cons', 'Actionable advice'],
 ARRAY['careers', 'sa_universities', 'subject_career_mapping']),

('Q13', 'career_misconceptions', 'Should I study what I love or what pays well?',
 'This is THE question everyone asks. Here''s the framework to decide: Scenario 1: You Love Something That Pays Well (e.g., Love coding → study Computer Science. Love medicine → study to be doctor). Decision: Easy. Do it. You''re lucky. Scenario 2: You Love Something That Pays Poorly (e.g., Love music → studying Music Performance pays R8K-R15K/month). Decision: Two options - Option A: Study your passion + build side income plan (e.g., BA Music + teach music lessons + gig on weekends), Option B: Study something practical (e.g., BCom) + pursue passion as hobby/side project until it''s viable. Scenario 3: You Don''t Love Anything Specific Yet (You''re 17, haven''t experienced enough careers to know). Decision: Study something practical with job security (teaching, nursing, BCom, IT). Discover passions through work experience. Scenario 4: You Hate What Pays Well (Example: Parents push engineering, but you hate it). Decision: DON''T do it. You''ll drop out or be miserable. Find middle ground (data science if you like patterns but not engines). The Middle Path (Recommended): 1) Study something you''re GOOD at and can tolerate (not hate, not obsessed love—just solid), 2) Ensure it has job market demand, 3) Build financial security first (R20K-R30K/month stable), 4) Then explore passion projects on side, 5) Eventually, passion project may become main income. Real Talk from SA Context: Unemployment is 33%. Passion alone doesn''t pay rent. Many "follow your passion" grads are unemployed/underemployed. BUT passion + strategy + financial literacy = sustainable career. Bottom Line: Study something you can tolerate that has job demand. Once financially stable, chase passion.',
 ARRAY['Decision framework', 'Four scenarios covered', 'Middle path recommended', 'SA unemployment context', 'Practical advice', 'Real-world examples', 'Financial security first'],
 ARRAY['careers', 'subject_career_mapping']),

('Q14', 'career_misconceptions', 'Do employers care about which university I attended?',
 'It depends on the industry, role, and stage of your career. Industries Where University Matters A LOT: 1) Law - Top firms recruit heavily from UCT/Wits law schools. 2) Investment Banking/Finance - Banks (Investec, RMB, etc.) prefer UCT/Wits/Stellenbosch BCom grads. 3) Medicine - Hospital training quality varies. Wits/UCT = better hospital networks. 4) Engineering (Big Companies) - Eskom, Sasol prefer top university grads for graduate programs. Industries Where University Matters LESS: 1) Tech/IT - Skills + portfolio matter most. Self-taught devs get hired if they can code well. 2) Teaching - All B.Ed graduates are equally qualified. Schools hire based on personality/experience. 3) Nursing - All nursing degrees meet SANC standards. Hospitals don''t discriminate by university. 4) SMEs/Startups - Small companies care about skills, not credentials. 5) Sales/Marketing - Results matter more than education. The Truth About University Brand: Year 1-3 of Career: University name helps get first interview. After that, work experience matters more. By Year 5+: Nobody cares. Your track record speaks for itself. Example: Graduate A (BCom Accounting from UCT) gets interview at PwC easier due to brand. Graduate B (BCom Accounting from UJ) may need to apply to 20 companies vs 10, but still gets hired. 5 Years Later: Both are CAs. Clients don''t ask where they studied. Performance matters. Smart Strategy: If top university accepts you + you have funding, go. It helps short-term. If top university = R100K debt vs local university = R0 debt, choose local. Debt-free beats brand name.',
 ARRAY['Industry-specific advice', 'When it matters', 'When it doesn''t', 'Career stage matters', 'Specific examples', 'Strategic decision framework', 'Debt consideration'],
 ARRAY['sa_universities', 'careers', 'study_costs']),

('Q15', 'career_misconceptions', 'Is entrepreneurship a realistic career path straight out of school?',
 'Short answer: Possible, but hard. Most successful entrepreneurs start businesses AFTER gaining work experience and saving capital. The Harsh Reality: 90% of SA startups fail. You need capital (even small businesses need R10K-R50K startup costs). You need business skills (sales, finance, operations)—hard to learn in classroom. No income for 6-12 months (or longer) while building business. No safety net if it fails. When Straight-to-Entrepreneurship Works: 1) Low-Capital Businesses (tutoring, car wash, event planning, social media management, graphic design) - Start with R2K-R10K. Test on weekends while studying or working. 2) Skills-Based Services - You have a skill (coding, baking, hairdressing). Freelance first, build clients, then go full-time. 3) Family Business - Family has existing business you can join/grow. Lower risk. 4) You Have Savings/Support - Parents can support you for 12-24 months while you build OR you saved R50K-R100K from part-time work. When You Should Get a Job First: 1) You have zero capital - Need income to survive. 2) You don''t have a validated business idea - Don''t quit everything to "figure it out." Test idea part-time first. 3) You lack business skills - Work 2-3 years in sales, operations, or finance. Learn how businesses actually work. THEN start yours. 4) Your family depends on your income - Too risky. Recommended Path (Smart Entrepreneurship): Year 1-3: Get a job in your field. Learn industry secrets. Build network. Save R50K-R100K. Year 2-4: Start side business (nights/weekends). Test if customers will pay. Refine model. Year 4-5: If side business earns 50% of salary, consider going full-time. If not, keep as side income. Bottom Line: Entrepreneurship is romantic but risky. If you''re passionate, TEST your idea while working/studying. Don''t bet your future on unvalidated dreams. Build runway first.',
 ARRAY['Harsh reality stated', 'Failure rate mentioned', 'When it works', 'When to get job first', 'Recommended path', 'Specific examples', 'Capital requirements', 'Risk mitigation'],
 ARRAY['careers', 'alternative_pathways']);


-- 4IR/Emerging Careers questions (Q16-Q18) and Decision-Making questions (Q19-Q20)
INSERT INTO test_questions (question_id, category, question_text, ideal_answer, key_points, required_modules) VALUES

('Q16', '4ir_emerging', 'What are the fastest-growing careers in South Africa right now?',
 'Based on 2025 SA labor market data, here are the high-growth fields: 1) AI/Data Science/Machine Learning - Every company is digitizing. Need data analysts, AI engineers, machine learning specialists. Demand: Capitec, Discovery, banks, retailers hiring heavily. Salary: R25K-R50K starting, R80K+ with 3-5 years experience. Study: BSc Data Science, Computer Science, or BCom Analytics. 2) Renewable Energy/Green Jobs - Load shedding forcing solar/wind adoption. Government''s Just Energy Transition plan. Demand: Solar installers, wind technicians, energy consultants. Salary: R18K-R35K starting, R50K+ senior level. Study: Electrical Engineering (renewables focus), TVET electrical, BSc Environmental Science. 3) Cybersecurity - Increasing cyberattacks on SA companies (Transnet, Deloitte hacked). Demand: All large companies need cybersecurity analysts. Salary: R25K-R45K starting, R100K+ senior level. Study: BCom Informatics, BSc Computer Science + certifications (CompTIA, CISSP). 4) Healthcare (Especially Nursing, Physio, OT) - Aging population, post-COVID health focus. Demand: 31,000+ vacant healthcare positions in public sector. Salary: Nurses R15K-R30K, Physiotherapists R20K-R40K. Study: Nursing diploma (4 years), BSc Physiotherapy. 5) Digital Marketing/E-Commerce - Businesses moving online (DHET-Takealot partnership proves this). Demand: Social media managers, SEO specialists, content creators. Salary: R12K-R25K starting, R40K+ with experience. Study: BCom Marketing + online courses (Google Analytics, Meta Blueprint). Declining Careers to Avoid: Traditional print journalism (industry shrinking), Bank tellers (automation replacing roles), Coal industry jobs (Just Energy Transition phasing out coal), General admin roles (being automated). Bottom Line: AI, green energy, cybersecurity, and healthcare are booming. Position yourself in growth industries for job security.',
 ARRAY['AI/Data Science growth', 'Renewable Energy growth', 'Cybersecurity growth', 'Healthcare demand', 'Digital Marketing growth', 'Salary ranges', 'Declining careers listed', 'Government initiatives mentioned'],
 ARRAY['4ir_emerging_jobs', 'careers', 'bursaries']),

('Q17', '4ir_emerging', 'Do I need to know coding to work in tech?',
 'No! Tech industry has many non-coding roles. Tech Roles That DON''T Require Coding: 1) UX/UI Designer - Design user experiences for apps/websites. Tools: Figma, Adobe XD (no code needed). Salary: R18K-R35K starting. Study: Interaction Design, Visual Communication, or learn online. 2) Product Manager - Decide WHAT to build (not how to build it). Manage developers, prioritize features. Salary: R25K-R50K starting. Study: BCom Informatics, Engineering (then transition), or work up from junior roles. 3) Digital Marketing/Growth - Drive traffic, run ads, analyze data. Tools: Google Ads, Facebook Ads, Google Analytics. Salary: R15K-R30K starting. Study: BCom Marketing + online courses. 4) Technical Writer - Write documentation, help guides, API docs. Need to understand tech, not code it. Salary: R18K-R30K starting. Study: BA English/Communications + tech interest. 5) Quality Assurance (QA) Tester - Test software for bugs. Some coding helps but not required. Salary: R12K-R25K starting. Study: BCom Informatics or learn on the job. 6) Tech Sales/Account Management - Sell software to businesses. Need to understand product, not build it. Salary: R15K-R30K base + commission (can reach R50K+). Study: BCom Marketing/Sales. 7) Data Analyst (Basic) - Analyze data in Excel/Tableau (not always coding). Salary: R18K-R30K starting. Study: BCom Analytics, BCom Informatics. Should You Learn Coding Anyway? Yes—even if you don''t code for a living, basic coding helps: Understand how products work (makes you better PM/designer), Automate boring tasks (Excel macros, Python scripts), Career flexibility (can transition to developer role later), Higher salary potential (coding = premium skill). Bottom Line: You DON''T need to code to work in tech. Many roles focus on design, strategy, marketing, or operations. But learning basic coding makes you more valuable and opens more doors.',
 ARRAY['7 non-coding tech roles', 'Salary ranges', 'Study paths', 'Should learn coding anyway', 'Career flexibility', 'Specific tools mentioned', 'Entry paths'],
 ARRAY['4ir_emerging_jobs', 'careers', 'university_alternatives']),

('Q18', '4ir_emerging', 'Should I learn AI tools (like ChatGPT) or will they replace my job?',
 'Great question—this is THE career question of 2025. AI Will NOT Replace You IF You Learn to Use AI. Think of AI like Excel in 1990: People feared "Excel will replace accountants!" Reality: Excel made accountants MORE valuable (faster analysis, better insights). Accountants who refused to learn Excel? They got replaced. Same with AI in 2025: AI will replace people who DON''T use AI. AI will make people who USE AI 10x more productive. Jobs at HIGHEST Risk (Will Shrink 30-50% by 2030): Data entry clerks (ChatGPT can automate), Basic customer service (chatbots replacing humans), Simple copywriting (AI writes ads now), Junior research analysts (AI summarizes reports), Basic translation (Google Translate improving). Jobs at LOWEST Risk (Will Grow Despite AI): Healthcare (nursing, doctors)—humans need human touch, Trades (electricians, plumbers)—AI can''t fix pipes, Teaching (young children)—social skills matter, Creative strategy (AI executes, humans ideate), Complex problem-solving (engineers, scientists), Sales/relationships (humans buy from humans). How to Be AI-Proof: Strategy 1: Learn to Use AI Tools (ChatGPT for research, writing, brainstorming; Midjourney/DALL-E for design; GitHub Copilot for coding; Notion AI for project management). Strategy 2: Focus on Human Skills AI Can''t Do (Emotional intelligence, Complex decision-making, Creativity, Physical skills, Relationship building). Strategy 3: Choose AI-Enhanced Careers (Not AI-Replaced): Doctor + AI (AI diagnoses, you treat), Teacher + AI (AI grades, you mentor), Designer + AI (AI generates options, you refine), Lawyer + AI (AI researches cases, you argue). What to Do NOW: 1) Sign up for free AI tools (ChatGPT, Claude, Canva AI), 2) Experiment (Use AI for homework, projects, side hustles), 3) Study AI-adjacent fields (Data science, UX design, product management), 4) Stay curious (AI is changing monthly. People who adapt win). Bottom Line: AI won''t replace YOU if you learn to use AI. Think of AI as your assistant, not your replacement. The future belongs to humans who collaborate with AI, not compete against it.',
 ARRAY['AI won''t replace if you learn it', 'Excel analogy', 'High-risk jobs', 'Low-risk jobs', 'AI-proof strategies', 'AI-enhanced careers', 'Actionable steps', 'Tools to learn'],
 ARRAY['4ir_emerging_jobs', 'careers', 'university_alternatives']),

('Q19', 'decision_making', 'I''m stuck between two career paths. How do I choose?',
 'Being stuck is normal—it means you''re thinking deeply. Here''s a decision framework: Step 1: Write Down Both Options with Full Details. Step 2: Score Each Option on These 7 Factors (1-10 scale): Interest (Do I enjoy this?) ×3, Ability (Am I good at required subjects?) ×3, Job Security (Will I find work?) ×2, Salary Potential (Can I support myself/family?) ×2, Affordability (Can I fund this study path?) ×2, Work-Life Balance (Will I have time for family/hobbies?) ×1, Alignment with Values (Does this feel meaningful?) ×2. Calculate weighted scores. Step 3: Test Your Gut Reaction - After seeing the scores, ask yourself: "Do I feel relieved that Option A won, or disappointed that Option B lost?" If relieved → go with the winner. If disappointed → your gut wants the "loser" (scores may have wrong weights). Step 4: Talk to Professionals in Both Fields - Find a professional in each field (LinkedIn, family friends, cold messages). Ask: "What do you wish you knew before studying this?" Real-world insights beat career guide books. Step 5: Try Before You Decide (If Possible) - Job shadow for 1 day in each field. See which environment feels right. Common Stuck Points: "Both look great, I can''t choose" - Solution: Pick the MORE AFFORDABLE one. You can always switch careers later (many doctors trained as something else first). "Family wants A, I want B" - Solution: Show family your scoring matrix. If they can''t counter with logic (just emotion), choose B. "I''m scared of choosing wrong" - Solution: There is no "wrong" choice, only different paths. Both lead to good lives if you work hard. Choose, commit, don''t look back. Bottom Line: Use data (scoring system) + gut feeling + real-world research. If still stuck after this, flip a coin—your reaction to the coin flip reveals what you truly want.',
 ARRAY['Decision framework', 'Scoring system', 'Gut check method', 'Talk to professionals', 'Job shadowing', 'Common stuck points addressed', 'Practical tool provided'],
 ARRAY['careers', 'subject_career_mapping']),

('Q20', 'decision_making', 'What if I choose a career and later realize I made a mistake?',
 'This fear stops many students from deciding. Here''s the truth: career changes are NORMAL and common in modern SA economy. Reality Check: Average person changes careers 3-5 times over lifetime. 40% of SA professionals work in fields unrelated to their degrees. Career "mistakes" are learning experiences, not failures. What to Do If You Realize You Made a Mistake: Scenario 1: You''re Still Studying (Year 1-2) - Option A: Switch degrees (if you''re early enough). Most universities allow degree changes in Year 1. You might lose 1 semester, but that''s better than 4 years in wrong field. Check: Will NSFAS still fund you if you change? Option B: Finish degree, pivot after. If you''re Year 3+, finishing might be faster than restarting. Use electives to explore other interests. Example: Finish BA History, then do postgrad in Education or Law. Scenario 2: You''ve Graduated But Hate Your Job (Year 1-3 Post-Grad) - Option A: Find related role that fits better. Example: Studied accounting, hate auditing → try financial analysis, tax consulting, or corporate finance. Your degree still has value, just different application. Option B: Postgraduate study in new field. Example: BCom → PGCE (teaching diploma) in 1 year. BSc → MBA → transition to business. Engineering → Data Science Masters. Option C: Learn new skills (faster than new degree). Example: Studied marketing, want to do UX design → 6-month UX bootcamp (ALX, Udacity). Studied teaching, want tech career → self-learn coding + build portfolio. Scenario 3: You''re 5+ Years Into Career, Want Complete Change - Option A: Side hustle transition (safest). Keep day job, start new career on weekends. Once side income = 50% of salary, consider full transition. Example: Accountant starts photography business, transitions over 2 years. Option B: Study part-time while working. UNISA, online courses, evening classes. Takes longer but financially safer. Option C: Bold move (quitting to retrain). Only if: You have R50K-R100K saved (6-12 month runway). Rare but sometimes necessary for major pivots. Cost of "Mistakes": 1 year "wasted" = not a big deal in 40-year career. R50K-R100K debt = manageable over 5-10 years. Real cost is STAYING in wrong career for 10 years (burnout, regret). How to Minimize "Mistakes": 1) Research careers deeply BEFORE studying (job shadowing, informational interviews), 2) Do internships during degree (test if you actually like the work), 3) Choose flexible degrees (BCom, BSc, BA open many doors), 4) Don''t study hyper-specialized fields unless you''re 90% sure (e.g., Marine Biology vs general BSc Biology). Bottom Line: "Mistakes" are fixable. Career changes are normal. The only real mistake is staying miserable for years because you''re too scared to pivot. SA economy rewards adaptability. Choose, learn, adjust as needed.',
 ARRAY['Career changes are normal', 'Statistics on career changes', 'Three scenarios covered', 'Multiple options per scenario', 'Cost of mistakes quantified', 'How to minimize mistakes', 'Real examples', 'Empowering message'],
 ARRAY['careers', 'sa_universities', 'alternative_pathways', 'university_alternatives']);

-- ============================================================================
-- END OF SAMPLE DATA
-- ============================================================================

-- Verify data loaded
SELECT 'Universities loaded:' as info, COUNT(*) as count FROM universities
UNION ALL
SELECT 'University programs loaded:', COUNT(*) FROM university_programs
UNION ALL
SELECT 'Bursaries loaded:', COUNT(*) FROM bursaries
UNION ALL
SELECT 'Careers loaded:', COUNT(*) FROM careers
UNION ALL
SELECT 'Subject-career mappings loaded:', COUNT(*) FROM subject_career_mappings
UNION ALL
SELECT 'Emerging careers loaded:', COUNT(*) FROM emerging_careers
UNION ALL
SELECT 'Test questions loaded:', COUNT(*) FROM test_questions;
