# Private Higher Education Institutions Knowledge Base

This module contains structured information about DHET-registered private universities and higher education institutions offering degree-level qualifications in South Africa.

## Structure

- `universities.json` - Main data file with all private higher education information
- `CONTENT-SPEC.md` - Detailed specification for content structure
- Upload script in `scripts/upload-private-higher-ed.js`

## Difference from Private Institutions

**Private Higher Ed (this module):**
- Degree-granting institutions (Bachelor, Honours, Masters)
- NQF Level 7-10
- CHE accredited
- Examples: Varsity College, Regent, Monash SA, AFDA, Vega

**Private Institutions (separate module):**
- TVET-level training (Diplomas, Certificates, NATED)
- NQF Level 2-6
- Examples: Damelin, Boston, Jeppe College

## Data Format

Each university entry includes:
- University name and registration details
- CHE accreditation status
- Location and campuses
- Degree programmes (Bachelor, Honours, Masters)
- Entry requirements (APS scores)
- Estimated costs
- Bursary information
- Career outcomes

## Key Features

- **Cost Information**: Annual tuition estimates
- **Accreditation**: DHET registration and CHE accreditation
- **Flexible Entry**: Often lower APS requirements than public universities
- **Specialized Programmes**: Niche fields like film, design, business
- **Multiple Campuses**: National presence
- **Industry Links**: Strong employer partnerships

## Status

- [ ] Initial data loaded
- [ ] Embeddings generated
- [ ] Integrated with RAG system
- [ ] Tested with sample queries
