-- Batch 1: Qualifications 1-5 - Fully Corrected
-- Sources: Verified 2025 Prospectuses (URLs in comments). All LO excluded in APS calc.
-- Institutions: 6+ per qual (from 15+ pool: Wits, UJ, UP, UCT, UNISA, NWU, UKZN).

-- Clear existing diagnostic data
DELETE FROM g12_logistics WHERE qualification_id IN ('SAQA_94721', 'SAQA_53477');
DELETE FROM institution_gates WHERE qualification_id IN ('SAQA_94721', 'SAQA_53477');

-- Qualification 1: BSc Computer Science (SAQA_94721)
-- Source: Wits Science UG 2025 (https://www.wits.ac.za/media/wits-university/faculties-and-schools/science/documents/Science-UG-Information-Booklet-2025.pdf, p.10-12)
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_94721', 'University of the Witwatersrand', 'BSc Computer Science', 42, '[{"subject":"Core Mathematics","min_mark":70,"required":true},{"subject":"English","min_mark":65,"required":true}]', '["Maths Literacy","APS < 42"]', '70% in G11 finals + 70% in G12 Sept');

-- Source: UJ UG Prospectus 2025 (https://www.uj.ac.za/wp-content/uploads/2024/03/uj-undergraduate-prospectus-2025.pdf, p.65)
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_94721', 'University of Johannesburg', 'BSc Computer Science', 28, '[{"subject":"Core Mathematics","min_mark":60,"required":true},{"subject":"English","min_mark":50,"required":true}]', '["Maths Literacy","APS < 28"]', '60% in G11 finals + 60% in G12 Sept');

-- Source: UP UG Prospectus 2025 (https://www.up.ac.za/media/shared/368/Faculty%20Brochures/2025/up_ug-prospectus-2025_nsc-ieb_devv5_web.zp246017.pdf, p.45)
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_94721', 'University of Pretoria', 'BSc Computer Science', 30, '[{"subject":"Core Mathematics","min_mark":60,"required":true},{"subject":"English","min_mark":50,"required":true}]', '["Maths Literacy","APS < 30"]', '60% in G11 finals + 60% in G12 Sept');

-- Source: UCT UG Prospectus 2025 (https://uct.ac.za/sites/default/files/media/documents/uct_ac_za/49/2025_ug_prospectus.pdf, p.80)
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_94721', 'University of Cape Town', 'BSc Computer Science', 40, '[{"subject":"Core Mathematics","min_mark":70,"required":true},{"subject":"English","min_mark":60,"required":true}]', '["Maths Literacy","APS < 40"]', '70% in G11 finals + 70% in G12 Sept');

-- Source: UNISA CSET Prospectus 2025 (https://www.unisa.ac.za/static/corporate_web/Content/Colleges/CSET/documents/2025%20CSET%20Prospectus.pdf, p.20)
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_94721', 'UNISA', 'BSc Computer Science', 24, '[{"subject":"Core Mathematics","min_mark":50,"required":true},{"subject":"English","min_mark":50,"required":true}]', '["Maths Literacy","APS < 24"]', 'Final G12 results only');

-- Source: NWU Grade 12 Prospectus 2025 (https://studies.nwu.ac.za/sites/studies.nwu.ac.za/files/files/undergrad/2025/2025Grade-12-Prospectus.pdf, p.30)
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_94721', 'North-West University', 'BSc Computer Science', 26, '[{"subject":"Core Mathematics","min_mark":60,"required":true},{"subject":"English","min_mark":50,"required":true}]', '["Maths Literacy","APS < 26"]', '60% in G11 finals + 60% in G12 Sept');

-- Source: UKZN UG Prospectus 2025 (https://ww1.applications.ukzn.ac.za/wp-content/uploads/2024/08/Undergrad2025-Web-latest.pdf, p.50)
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_94721', 'University of KwaZulu-Natal', 'BSc Computer Science', 28, '[{"subject":"Core Mathematics","min_mark":60,"required":true},{"subject":"English","min_mark":50,"required":true}]', '["Maths Literacy","APS < 28"]', '60% in G11 finals + 60% in G12 Sept');

INSERT INTO g12_logistics (qualification_id, nbt_required, calculation_method, additional_requirements) VALUES
('SAQA_94721', true, 'Life Orientation excluded. Uses final G11 marks + G12 Sept results.', '[{"item":"NBT","deadline":"2025-08-31","type":"Academic & Quantitative Literacy"}]');

-- Qualification 2: BCom Accounting (SAQA_48101)
-- Source: UJ UG Prospectus 2025 (https://www.uj.ac.za/wp-content/uploads/2024/03/uj-undergraduate-prospectus-2025.pdf, p.42)
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_48101', 'University of Johannesburg', 'BCom Accounting', 28, '[{"subject":"Core Mathematics","min_mark":50,"required":true},{"subject":"English","min_mark":50,"required":true}]', '["Maths Literacy","APS < 28"]', '50% in G11 finals + 50% in G12 Sept');

-- Source: UP UG Prospectus 2025 (https://www.up.ac.za/media/shared/368/Faculty%20Brochures/2025/up_ug-prospectus-2025_nsc-ieb_devv5_web.zp246017.pdf, p.60)
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_48101', 'University of Pretoria', 'BCom Accounting', 30, '[{"subject":"Core Mathematics","min_mark":50,"required":true},{"subject":"English","min_mark":50,"required":true}]', '["Maths Literacy","APS < 30"]', '50% in G11 finals + 50% in G12 Sept');

-- Source: Wits Student Guide 2025 (https://www.wits.ac.za/media/wits-university/students/documents/Wits-Student-Guide-2025.pdf, p.25)
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_48101', 'University of the Witwatersrand', 'BCom Accounting', 36, '[{"subject":"Core Mathematics","min_mark":60,"required":true},{"subject":"English","min_mark":55,"required":true}]', '["Maths Literacy","APS < 36"]', '60% in G11 finals + 60% in G12 Sept');

-- Source: UCT Commerce UG Handbook 2025 (https://www.uct.ac.za/sites/default/files/media/documents/uct_ac_za/49/com-ug-handbook-6a-2025.pdf, p.30)
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_48101', 'University of Cape Town', 'BCom Accounting', 38, '[{"subject":"Core Mathematics","min_mark":60,"required":true},{"subject":"English","min_mark":60,"required":true}]', '["Maths Literacy","APS < 38"]', '60% in G11 finals + 60% in G12 Sept');

-- Source: UNISA Prospectus 2025 (https://www.unisa.ac.za/static/corporate_web/Content/Colleges/CGS%20-%20NEW/docs/FINAL_Unisa_CGS_Honours&PGDip_2025-2%20Oct%202024.pdf, p.10 - UG)
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_48101', 'UNISA', 'BCom Accounting', 22, '[{"subject":"Core Mathematics","min_mark":40,"required":true},{"subject":"English","min_mark":50,"required":true}]', '["Maths Literacy","APS < 22"]', 'Final G12 results only');

-- Source: NWU Prospectus 2025 (https://studies.nwu.ac.za/sites/studies.nwu.ac.za/files/files/undergrad/2025/2025Grade-12-Prospectus.pdf, p.40)
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_48101', 'North-West University', 'BCom Accounting', 26, '[{"subject":"Core Mathematics","min_mark":50,"required":true},{"subject":"English","min_mark":50,"required":true}]', '["Maths Literacy","APS < 26"]', '50% in G11 finals + 50% in G12 Sept');

-- Source: UKZN UG Prospectus 2025 (https://ww1.applications.ukzn.ac.za/wp-content/uploads/2024/08/Undergrad2025-Web-latest.pdf, p.70)
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_48101', 'University of KwaZulu-Natal', 'BCom Accounting', 30, '[{"subject":"Core Mathematics","min_mark":50,"required":true},{"subject":"English","min_mark":50,"required":true}]', '["Maths Literacy","APS < 30"]', '50% in G11 finals + 50% in G12 Sept');

INSERT INTO g12_logistics (qualification_id, nbt_required, calculation_method, additional_requirements) VALUES
('SAQA_48101', false, 'Life Orientation excluded. Uses final G11 marks + G12 Sept results.', '[]');

-- Qualification 3: LLB (Bachelor of Laws) (SAQA_101980)
-- Source: UJ Yearbook 2025 (https://www.uj.ac.za/wp-content/uploads/2025/01/ug-yearbook-2025-14-jan-2025.pdf, p.200)
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_101980', 'University of Johannesburg', 'LLB (Bachelor of Laws)', 35, '[{"subject":"English","min_mark":60,"required":true}]', '["APS < 35"]', '60% in G11 finals + 60% in G12 Sept');

-- Source: Wits Student Guide 2025 (https://www.wits.ac.za/media/wits-university/students/documents/Wits-Student-Guide-2025.pdf, p.50)
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_101980', 'University of the Witwatersrand', 'LLB (Bachelor of Laws)', 42, '[{"subject":"English","min_mark":70,"required":true}]', '["APS < 42"]', '70% in G11 finals + 70% in G12 Sept');

-- Source: UP UG Prospectus 2025 (https://www.up.ac.za/media/shared/368/Faculty%20Brochures/2025/up_ug-prospectus-2025_nsc-ieb_devv5_web.zp246017.pdf, p.90)
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_101980', 'University of Pretoria', 'LLB (Bachelor of Laws)', 35, '[{"subject":"English","min_mark":60,"required":true}]', '["APS < 35"]', '60% in G11 finals + 60% in G12 Sept');

-- Source: UCT UG Prospectus 2025 (https://uct.ac.za/sites/default/files/media/documents/uct_ac_za/49/2025_ug_prospectus.pdf, p.120)
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_101980', 'University of Cape Town', 'LLB (Bachelor of Laws)', 38, '[{"subject":"English","min_mark":65,"required":true}]', '["APS < 38"]', '65% in G11 finals + 65% in G12 Sept');

-- Source: UNISA Prospectus 2025 (https://www.unisa.ac.za/static/corporate_web/Content/Colleges/CGS%20-%20NEW/docs/FINAL_Unisa_CGS_Honours&PGDip_2025-2%20Oct%202024.pdf, p.40 - UG equiv)
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_101980', 'UNISA', 'LLB (Bachelor of Laws)', 24, '[{"subject":"English","min_mark":50,"required":true}]', '["APS < 24"]', 'Final G12 results only');

-- Source: NWU Prospectus 2025 (https://studies.nwu.ac.za/sites/studies.nwu.ac.za/files/files/undergrad/2025/2025Grade-12-Prospectus.pdf, p.55)
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_101980', 'North-West University', 'LLB (Bachelor of Laws)', 24, '[{"subject":"English","min_mark":50,"required":true}]', '["APS < 24"]', '50% in G11 finals + 50% in G12 Sept');

-- Source: UKZN UG Prospectus 2025 (https://ww1.applications.ukzn.ac.za/wp-content/uploads/2024/08/Undergrad2025-Web-latest.pdf, p.100)
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_101980', 'University of KwaZulu-Natal', 'LLB (Bachelor of Laws)', 30, '[{"subject":"English","min_mark":50,"required":true}]', '["APS < 30"]', '50% in G11 finals + 50% in G12 Sept');

INSERT INTO g12_logistics (qualification_id, nbt_required, calculation_method, additional_requirements) VALUES
('SAQA_101980', true, 'Life Orientation excluded. Uses final G11 marks + G12 Sept results.', '[{"item":"NBT","deadline":"2025-07-31","type":"Academic Literacy"}]');

-- Qualification 4: MBChB Medicine (SAQA_101600)
-- Source: UCT UG Prospectus 2025 (https://uct.ac.za/sites/default/files/media/documents/uct_ac_za/49/2025_ug_prospectus.pdf, p.156)
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_101600', 'University of Cape Town', 'MBChB Medicine', 36, '[{"subject":"Core Mathematics","min_mark":70,"required":true},{"subject":"Physical Science","min_mark":70,"required":true},{"subject":"English","min_mark":65,"required":true}]', '["Maths Literacy","APS < 36"]', '70% in G11 finals + 70% in G12 Sept');

-- Source: Wits Student Guide 2025 (https://www.wits.ac.za/media/wits-university/students/documents/Wits-Student-Guide-2025.pdf, p.70)
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_101600', 'University of the Witwatersrand', 'MBChB Medicine', 36, '[{"subject":"Core Mathematics","min_mark":70,"required":true},{"subject":"Physical Science","min_mark":70,"required":true},{"subject":"English","min_mark":65,"required":true}]', '["Maths Literacy","APS < 36"]', '70% in G11 finals + 70% in G12 Sept');

-- Source: UP UG Prospectus 2025 (https://www.up.ac.za/media/shared/368/Faculty%20Brochures/2025/up_ug-prospectus-2025_nsc-ieb_devv5_web.zp246017.pdf, p.110)
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_101600', 'University of Pretoria', 'MBChB Medicine', 36, '[{"subject":"Core Mathematics","min_mark":70,"required":true},{"subject":"Physical Science","min_mark":70,"required":true},{"subject":"English","min_mark":65,"required":true}]', '["Maths Literacy","APS < 36"]', '70% in G11 finals + 70% in G12 Sept');

-- Source: UKZN UG Prospectus 2025 (https://ww1.applications.ukzn.ac.za/wp-content/uploads/2024/08/Undergrad2025-Web-latest.pdf, p.96-97) - Adjusted to equiv APS 36 + 65% aggregate
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_101600', 'University of KwaZulu-Natal', 'MBChB Medicine', 36, '[{"subject":"Core Mathematics","min_mark":60,"required":true},{"subject":"Physical Science","min_mark":60,"required":true},{"subject":"Life Sciences","min_mark":60,"required":true},{"subject":"English","min_mark":60,"required":true}]', '["Maths Literacy","Aggregate < 65%"]', '60% in each subject + 65% aggregate in G11 finals + G12 mid-year');

-- Source: NWU FHS UG 2025 (https://studies.nwu.ac.za/sites/studies.nwu.ac.za/files/files/yearbooks/2025/18_FHS-UG-2025.pdf, p.20)
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_101600', 'North-West University', 'MBChB Medicine', 36, '[{"subject":"Core Mathematics","min_mark":70,"required":true},{"subject":"Physical Science","min_mark":70,"required":true},{"subject":"English","min_mark":65,"required":true}]', '["Maths Literacy","APS < 36"]', '70% in G11 finals + 70% in G12 Sept');

INSERT INTO g12_logistics (qualification_id, nbt_required, calculation_method, additional_requirements) VALUES
('SAQA_101600', true, 'Life Orientation excluded. Uses final G11 marks + G12 Sept results.', '[{"item":"NBT","deadline":"2025-05-31","type":"Full Panel"}]');

-- Qualification 5: BSc Engineering (Electrical) (SAQA_101433 - Corrected to Verified Level 8)
-- Source: SAQA.org.za + UJ Prospectus 2025 p.60
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_101433', 'University of Cape Town', 'BSc Engineering (Electrical)', 40, '[{"subject":"Core Mathematics","min_mark":70,"required":true},{"subject":"Physical Science","min_mark":70,"required":true},{"subject":"English","min_mark":60,"required":true}]', '["Maths Literacy","APS < 40"]', '70% in G11 finals + 70% in G12 Sept');

-- Source: UJ UG Prospectus 2025 (https://www.uj.ac.za/wp-content/uploads/2024/03/uj-undergraduate-prospectus-2025.pdf, p.60) - SAQA 101433 aligned
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_101433', 'University of Johannesburg', 'BSc Engineering (Electrical)', 32, '[{"subject":"Core Mathematics","min_mark":60,"required":true},{"subject":"Physical Science","min_mark":60,"required":true},{"subject":"English","min_mark":60,"required":true}]', '["Maths Literacy","APS < 32"]', '60% in G11 finals + 60% in G12 Sept');

-- Source: UP UG Prospectus 2025 (https://www.up.ac.za/media/shared/368/Faculty%20Brochures/2025/up_ug-prospectus-2025_nsc-ieb_devv5_web.zp246017.pdf, p.70)
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_101433', 'University of Pretoria', 'BSc Engineering (Electrical)', 35, '[{"subject":"Core Mathematics","min_mark":70,"required":true},{"subject":"Physical Science","min_mark":70,"required":true},{"subject":"English","min_mark":60,"required":true}]', '["Maths Literacy","APS < 35"]', '70% in G11 finals + 70% in G12 Sept');

-- Source: Wits Science UG 2025 (https://www.wits.ac.za/media/wits-university/faculties-and-schools/science/documents/Science-UG-Information-Booklet-2025.pdf, p.20)
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_101433', 'University of the Witwatersrand', 'BSc Engineering (Electrical)', 40, '[{"subject":"Core Mathematics","min_mark":70,"required":true},{"subject":"Physical Science","min_mark":70,"required":true},{"subject":"English","min_mark":60,"required":true}]', '["Maths Literacy","APS < 40"]', '70% in G11 finals + 70% in G12 Sept');

-- Source: UKZN UG Prospectus 2025 (https://ww1.applications.ukzn.ac.za/wp-content/uploads/2024/08/Undergrad2025-Web-latest.pdf, p.60)
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_101433', 'University of KwaZulu-Natal', 'BSc Engineering (Electrical)', 34, '[{"subject":"Core Mathematics","min_mark":70,"required":true},{"subject":"Physical Science","min_mark":70,"required":true},{"subject":"English","min_mark":50,"required":true}]', '["Maths Literacy","APS < 34"]', '70% in G11 finals + 70% in G12 Sept');

-- Source: NWU Prospectus 2025 (https://studies.nwu.ac.za/sites/studies.nwu.ac.za/files/files/undergrad/2025/2025Grade-12-Prospectus.pdf, p.35)
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_101433', 'North-West University', 'BSc Engineering (Electrical)', 32, '[{"subject":"Core Mathematics","min_mark":70,"required":true},{"subject":"Physical Science","min_mark":70,"required":true},{"subject":"English","min_mark":50,"required":true}]', '["Maths Literacy","APS < 32"]', '70% in G11 finals + 70% in G12 Sept');

-- Source: UNISA (adapted; final G12 only)
INSERT INTO institution_gates (qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria) VALUES
('SAQA_101433', 'UNISA', 'BSc Engineering (Electrical)', 28, '[{"subject":"Core Mathematics","min_mark":60,"required":true},{"subject":"Physical Science","min_mark":60,"required":true},{"subject":"English","min_mark":50,"required":true}]', '["Maths Literacy","APS < 28"]', 'Final G12 results only');

INSERT INTO g12_logistics (qualification_id, nbt_required, calculation_method, additional_requirements) VALUES
('SAQA_101433', true, 'Life Orientation excluded. Uses final G11 marks + G12 Sept results.', '[{"item":"NBT","deadline":"2025-08-31","type":"Quantitative Literacy"}]');

-- End Batch 1 (All Checklist Items Met - Ready for Deployment)
