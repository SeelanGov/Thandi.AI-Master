# SETA Pathways Content Specification

## Document Purpose
Defines the structure, content requirements, and embedding strategy for SETA pathway data in Thandi's knowledge base.

## Data Structure

### SETA Entry Schema
```json
{
  "seta_short": "Abbreviation (e.g., MERSETA)",
  "seta_full": "Full official name",
  "province": "Head office province",
  "municipality": "Municipality",
  "town": "Town/City",
  "geo": "Latitude, Longitude",
  "postal_code": "Postal code",
  "programmes": [
    {
      "programme_type": "Type of qualification",
      "examples": "Specific qualifications offered",
      "nqf_level": "NQF level range",
      "min_points": "Minimum entry requirement",
      "required_subjects": "Subject requirements",
      "career_outcomes": ["List of careers"],
      "application_link": "Direct application URL"
    }
  ],
  "contact": "Email and phone",
  "website": "Official website",
  "unique_id": "ZAF-SETA-[CODE]"
}
```

## Content Requirements

### Completeness
- ✅ All 21 SETAs included
- ✅ Geographic data for each SETA
- ✅ Programme examples for each sector
- ✅ Entry requirements specified
- ✅ Career outcomes listed
- ✅ Contact information provided
- ✅ Application links included

### Accuracy Standards
- Official SETA names and abbreviations
- Verified contact information
- Current programme offerings
- Accurate NQF level classifications
- Valid application URLs

### Student-Centric Language
- Clear programme descriptions
- Accessible entry requirements
- Realistic career outcomes
- Practical application guidance

## Embedding Strategy

### Chunk Types

#### 1. SETA Overview Chunks
**Purpose**: General SETA information and sector coverage
**Content**: Name, sector, location, contact
**Example Query Match**: "What is MERSETA?", "SETAs in Gauteng"

#### 2. Programme-Specific Chunks
**Purpose**: Detailed qualification information
**Content**: Programme type, examples, NQF level, requirements
**Example Query Match**: "How do I become a welder?", "Electrician training"

#### 3. Career Pathway Chunks
**Purpose**: Link careers to SETA training
**Content**: Career outcomes, entry requirements, application process
**Example Query Match**: "I want to be a chef", "Banking careers without university"

#### 4. Geographic Chunks
**Purpose**: Location-based SETA discovery
**Content**: Province, municipality, contact details
**Example Query Match**: "SETAs in Western Cape", "Training near me"

### Metadata Tags
Each chunk should include:
- `content_type`: "seta_pathway"
- `seta_code`: SETA abbreviation
- `sector`: Industry sector
- `nqf_level`: Level range
- `province`: Location
- `career_tags`: Related careers
- `subject_requirements`: Required subjects

## Query Patterns to Support

### Direct SETA Queries
- "What is [SETA name]?"
- "How do I apply to [SETA]?"
- "Where is [SETA] located?"

### Career-to-SETA Mapping
- "I want to be a [career], which SETA?"
- "How do I become a [occupation]?"
- "Training for [career field]"

### Subject-Based Matching
- "I have Maths and Science, what SETAs?"
- "SETAs that don't need Physical Science"
- "Training with Grade 10"

### Geographic Discovery
- "SETAs in [province]"
- "Training near [location]"
- "Learnerships in my area"

### Alternative Pathways
- "I didn't get into university, what now?"
- "Practical training options"
- "Apprenticeships available"

## Integration Points

### Career Content
- Link SETA programmes to career profiles
- Map career outcomes to specific SETAs
- Connect subject requirements

### Institution Pathways
- TVET colleges often partner with SETAs
- Some private institutions offer SETA-accredited programmes
- Universities may have SETA-linked WIL programmes

### Financial Aid
- SETA bursaries and funding
- Learnership stipends
- Employer-sponsored training

### Geographic Data
- Provincial distribution
- Municipal coverage
- Accessibility considerations

## Quality Assurance

### Verification Checklist
- [ ] All 21 SETAs included
- [ ] Contact information current
- [ ] Application links functional
- [ ] Programme examples accurate
- [ ] Career outcomes realistic
- [ ] Entry requirements clear
- [ ] Geographic data correct

### Update Triggers
- Annual SETA programme updates
- Contact information changes
- New qualification offerings
- Policy changes affecting entry requirements

## Success Metrics
- Student queries successfully matched to appropriate SETAs
- Accurate career-to-SETA recommendations
- Geographic-based SETA discovery working
- Application link click-through rates
- Student feedback on SETA guidance quality

## Version History
- v1.1 (2025-11-19): Initial comprehensive SETA database with all 21 SETAs
