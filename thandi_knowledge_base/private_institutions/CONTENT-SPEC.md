# Private Higher Education Institutions Content Specification

## Purpose
Provide students with information about private higher education options in South Africa, including costs, programmes, and pathways.

## Content Structure

### Institution Entry Format
```json
{
  "institution_code": "VARSITY",
  "institution_name": "Varsity College",
  "institution_type": "private",
  "registration_status": "Registered with DHET",
  "location": {
    "province": "Gauteng",
    "city": "Johannesburg",
    "campuses": ["Sandton", "Pretoria", "Durban"]
  },
  "programmes": [
    {
      "programme_name": "Bachelor of Commerce in Marketing Management",
      "programme_type": "Bachelor",
      "nqf_level": 7,
      "duration_years": 3,
      "min_requirements": "NSC with Bachelor pass (APS 23+)",
      "estimated_annual_cost": "R75,000 - R85,000",
      "career_outcomes": ["Marketing Manager", "Brand Manager", "Digital Marketer"]
    }
  ],
  "contact": {
    "email": "info@varsitycollege.co.za",
    "phone": "+27 11 555 1234"
  },
  "website": "https://www.varsitycollege.co.za",
  "application_link": "https://www.varsitycollege.co.za/apply"
}
```

## Integration Points

### With Existing Career Content
- Link programmes to career profiles
- Show private alternatives to public universities
- Highlight specialized/niche programmes

### With Decision Framework
- Support "I can't get into public university" scenarios
- Provide cost-benefit analysis
- Show flexible entry options

### With Misconceptions Framework
- Address "private = expensive" misconception
- Clarify accreditation and recognition
- Explain bursary/loan options

## Query Types to Support

1. **Programme Search**: "Where can I study graphic design privately?"
2. **Cost Comparison**: "How much does private IT education cost?"
3. **Location-based**: "Private colleges in Cape Town"
4. **Alternative Pathways**: "I didn't get into UCT, what are my options?"
5. **Specialized Fields**: "Private institutions for film and media"

## Content Guidelines

- Include only DHET-registered institutions
- Provide cost ranges (updated annually)
- Highlight unique/specialized programmes
- Include bursary/financial aid information
- Note accreditation status (CHE, professional bodies)

## Important Considerations

- **Cost Transparency**: Always provide estimated costs
- **Accreditation**: Verify DHET registration
- **Quality Indicators**: Mention industry partnerships, graduate employment rates
- **Financial Aid**: Include information about NSFAS eligibility, private bursaries

## Status Tracking

- Total institutions: 0
- Total programmes: 0
- Embeddings generated: No
- RAG integration: Pending
