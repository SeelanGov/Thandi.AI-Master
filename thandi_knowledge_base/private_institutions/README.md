# Private Higher Education Institutions Knowledge Base

This module contains structured information about registered private higher education institutions in South Africa, enabling Thandi to answer questions like:
- "What private colleges offer IT courses?"
- "Where can I study business management privately?"
- "What are the costs at private institutions?"

## Structure

- `institutions.json` - Main data file with all private institution information
- `CONTENT-SPEC.md` - Detailed specification for content structure
- Upload script in `scripts/upload-private-institutions.js`

## Data Format

Each institution entry includes:
- Institution name and registration details
- Location and contact information
- Programme offerings
- Entry requirements
- Estimated costs
- Career outcomes

## Status

- [ ] Initial data loaded
- [ ] Embeddings generated
- [ ] Integrated with RAG system
- [ ] Tested with sample queries

## Key Differences from Public Institutions

- Cost information included (tuition fees)
- Registration status with DHET
- Accreditation details
- Flexible entry requirements
- Often specialized/niche programmes
