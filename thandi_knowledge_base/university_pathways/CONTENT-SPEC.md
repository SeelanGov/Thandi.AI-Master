# University Pathways Content Specification

## Purpose
Provide students with concrete pathways from their current academic position to specific careers through South African universities.

## Content Structure

### University Entry Format
```json
{
  "university_code": "UCT",
  "university_name": "University of Cape Town",
  "university_type": "traditional|technology|comprehensive",
  "location": {
    "province": "Western Cape",
    "city": "Cape Town"
  },
  "faculties": [
    {
      "faculty_name": "Engineering & Built Environment",
      "programs": [
        {
          "degree_name": "BSc Engineering (Civil)",
          "degree_type": "BEng|BEngTech|BSc|BCom|etc",
          "nqf_level": "7-8",
          "duration_years": 4,
          "career_outcomes": ["Civil Engineer", "Structural Engineer"],
          "required_subjects": ["Mathematics", "Physical Sciences"],
          "recommended_subjects": [],
          "min_aps_estimate": 42
        }
      ]
    }
  ]
}
```

## Integration Points

### With Existing Career Content
- Link degree programs to career profiles in healthcare_careers, engineering_careers, 4ir_careers
- Cross-reference with subject-career-map.js

### With Decision Framework
- Support "where can I study" decision points
- Provide realistic pathway options based on student's subjects

### With Misconceptions Framework
- Address "I can't afford university" with UNISA/distance options
- Clarify difference between BEng vs BEngTech programs

## Query Types to Support

1. **Career-to-University**: "Where can I study to become a doctor?"
2. **University-to-Careers**: "What can I study at Wits?"
3. **Subject-to-Pathways**: "I take Maths and Science, what can I study?"
4. **Location-based**: "Which universities in Gauteng offer engineering?"
5. **Program-type**: "What's the difference between BEng and BEngTech?"

## Content Guidelines

- Focus on undergraduate (NQF 7-8) programs only
- Include all 26 public universities
- Maintain consistency in degree naming
- Link to official university resources where possible
- Update annually with program changes

## Status Tracking

- Total universities: 0/26
- Total faculties: 0
- Total programs: 0
- Embeddings generated: No
- RAG integration: Pending
