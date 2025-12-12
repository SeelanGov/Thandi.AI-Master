# Private Higher Education Institutions Content Specification

## Purpose
Provide students with information about DHET-registered private universities and higher education institutions offering degree-level qualifications.

## Content Structure

### University Entry Format
```json
{
  "university_code": "VARSITY",
  "university_name": "Varsity College (IIE)",
  "registration_status": "Registered with DHET",
  "accreditation": "CHE Accredited",
  "location": {
    "province": "National",
    "city": "Multiple campuses",
    "campuses": ["Sandton", "Pretoria", "Durban", "Cape Town"]
  },
  "programmes": [
    {
      "programme_name": "Bachelor of Commerce in Marketing Management",
      "qualification_type": "Bachelor",
      "nqf_level": 7,
      "duration_years": 3,
      "min_requirements": "NSC with Bachelor pass (APS 23+)",
      "estimated_annual_cost": "R75,000 - R85,000",
      "career_outcomes": ["Marketing Manager", "Brand Manager", "Digital Marketer"],
      "bursaries_available": true
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

## Key Institutions to Include

### Business & Management
- Varsity College (IIE)
- Regent Business School
- Milpark Education
- Monash South Africa

### Creative & Design
- Vega School
- Red & Yellow Creative School
- AFDA (Film School)
- Inscape Design College

### IT & Technology
- CTU Training Solutions
- Pearson Institute
- Eduvos

### Health Sciences
- Mediclinic Learning Centre
- Various nursing colleges

## Integration Points

### With Public Universities
- Show as alternatives when public university entry requirements not met
- Highlight specialized programmes not available at public institutions
- Compare costs and value proposition

### With Decision Framework
- Support "I didn't get into university" scenarios
- Provide cost-benefit analysis
- Show flexible payment options

### With Career Content
- Link programmes to specific career outcomes
- Show industry partnerships and graduate employment rates

## Content Guidelines

### Must Include
- DHET registration status
- CHE accreditation (where applicable)
- Estimated annual costs (tuition only)
- Entry requirements (APS scores)
- Programme duration
- Career outcomes

### Important Considerations
- **Cost Transparency**: Always provide cost ranges
- **Accreditation**: Verify DHET registration and CHE accreditation
- **Recognition**: Note if qualifications are recognized by professional bodies
- **Financial Aid**: Include NSFAS eligibility, private bursaries, payment plans
- **Graduate Outcomes**: Employment rates, industry partnerships

## Query Types to Support

1. **Alternative Pathways**: "I didn't get into UCT, what are my options?"
2. **Specialized Fields**: "Where can I study film and media?"
3. **Cost Comparison**: "How much does private university cost?"
4. **Location-based**: "Private universities in Johannesburg"
5. **Flexible Options**: "Can I study part-time at a private university?"

## Status Tracking

- Total universities: 0
- Total programmes: 0
- Embeddings generated: No
- RAG integration: Pending
