# University Pathways Knowledge Base

This module contains structured information about South African universities and their undergraduate programs, enabling Thandi to answer questions like:
- "Where can I study to become a civil engineer?"
- "Which universities offer nursing programs?"
- "What can I study at UCT?"

## Structure

- `universities.json` - Main data file with all university pathway information
- `CONTENT-SPEC.md` - Detailed specification for content structure
- `upload-script.js` - Script to process and upload to Supabase

## Data Format

Each university entry includes:
- University short name and full name
- Faculty/College name
- Key undergraduate degrees (NQF 7-8)
- Links to career outcomes

## Status

- [ ] Initial data loaded
- [ ] Embeddings generated
- [ ] Integrated with RAG system
- [ ] Tested with sample queries
