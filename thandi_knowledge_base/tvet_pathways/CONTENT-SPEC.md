# TVET College Pathways Content Specification

## Purpose
Provide students with accessible vocational and technical education pathways through South Africa's TVET (Technical and Vocational Education and Training) colleges.

## Content Structure

### TVET College Entry Format
```json
{
  "college_code": "CCTVET",
  "college_name": "Cape Town TVET College",
  "college_type": "public_tvet",
  "location": {
    "province": "Western Cape",
    "campuses": ["Crawford", "Athlone", "Gardens"]
  },
  "programs": [
    {
      "program_name": "National Certificate: Engineering Studies (N1-N3)",
      "program_type": "NC(V)|Report 191|N1-N6",
      "nqf_level": "2-4",
      "duration_years": 1-3,
      "fields": ["Electrical", "Mechanical", "Civil"],
      "entry_requirements": "Grade 9 or equivalent",
      "career_outcomes": ["Artisan", "Technician", "Tradesperson"],
      "progression_pathways": ["N4-N6", "Trade Test", "University of Technology"]
    }
  ]
}
```

## Key Differences from Universities

### Program Types
- **NC(V) Level 2-4**: National Certificate Vocational (replaces N1-N3)
- **Report 191 (N1-N6)**: Engineering studies, business studies
- **Occupational Certificates**: Artisan trades
- **Skills Programs**: Short courses (3-12 months)

### Entry Requirements
- Lower than universities (Grade 9-12)
- More accessible for students without university exemption
- Focus on practical skills

### Career Focus
- Hands-on technical skills
- Direct employment pathways
- Artisan development
- Industry partnerships

## Integration Points

### With University Pathways
- Show TVET as alternative to university
- Highlight progression routes (TVET → UoT)
- Address "university is the only option" misconception

### With Career Content
- Link to trades: electrician, plumber, welder
- Connect to 4IR skills: mechatronics, automation
- Show entrepreneurship opportunities

### With Decision Framework
- Support "I can't afford university" scenarios
- Provide "I want to work quickly" pathways
- Address "I failed matric" options

## Query Types to Support

1. **Alternative Pathways**: "I didn't get university exemption, what can I study?"
2. **Trade-specific**: "Where can I become an electrician?"
3. **Location-based**: "TVET colleges in Gauteng"
4. **Quick Employment**: "What can I study to work in 1 year?"
5. **Progression**: "Can I go to university after TVET?"

## Content Guidelines

- Focus on NQF 2-5 programs
- Include all 50 public TVET colleges
- Emphasize practical, employable skills
- Show clear progression pathways
- Include NSFAS eligibility info
- Highlight industry partnerships

## Status Tracking

- Total colleges: 0/50
- Total programs: 0
- Embeddings generated: No
- RAG integration: Pending
