# Thandi Frontend Design System - Figma PRD

**Product:** Thandi Career Assessment Platform  
**Deliverable:** Complete Figma Design System + High-Fidelity Mockups  
**Target:** No-code implementation (Replit/V0/Bolt)  
**Date:** November 2025  
**Version:** 1.0

---

## 1. Executive Summary

### Objective
Create a comprehensive Figma design system and high-fidelity mockups for Thandi's career assessment platform that can be directly implemented by no-code tools (Replit Agent, V0, Bolt) without requiring custom coding.

### Scope
- Complete design system with reusable components
- 8-12 key screens (landing, assessment flow, results, dashboard)
- Mobile-first responsive layouts (320px → 1440px)
- Culturally grounded African aesthetic with modern UX
- Export-ready assets for no-code platforms

### Success Criteria
- Designer can hand off Figma file → no-code builder implements in <2 days
- 100% brand guideline compliance
- Accessible (WCAG 2.1 AA minimum)
- Optimized for South African youth (ages 16-24)

---

## 2. Design System Requirements

### 2.1 Foundation Layer

**Color Tokens**
```
Primary/Teal-900: #114E4E (backgrounds, headers)
Primary/Teal-700: #1A6B6B (hover states)
Primary/Teal-500: #2C7A7B (borders, icons)

Secondary/Gold-600: #DFA33A (CTAs, highlights)
Secondary/Gold-500: #E8B84D (hover states)
Secondary/Gold-400: #F0C870 (disabled states)

Neutral/Cream-100: #F3E6C9 (page backgrounds)
Neutral/Cream-200: #E8D9B8 (card backgrounds)
Neutral/Brown-800: #5C3B20 (body text)
Neutral/Brown-600: #7A5436 (secondary text)

Accent/Orange-500: #C57B3B (alerts, emotion)
Accent/Gradient: linear-gradient(90deg, #2C7A7B 0%, #3AB795 100%)

Semantic/Success: #3AB795
Semantic/Warning: #DFA33A
Semantic/Error: #C57B3B
Semantic/Info: #2C7A7B
```

**Typography Scale**
```
Font Family:
- Headings: Poppins (Google Fonts)
- Body: Nunito (Google Fonts)
- Accent: DM Sans (Google Fonts)

Desktop Scale:
H1/Hero: Poppins SemiBold 48px / 56px (120% line height)
H2/Section: Poppins SemiBold 36px / 44px
H3/Card: Poppins Medium 24px / 32px
Body/Large: Nunito Regular 18px / 28px
Body/Default: Nunito Regular 16px / 24px
Body/Small: Nunito Regular 14px / 20px
Caption: Nunito Italic 12px / 16px

Mobile Scale (320px-768px):
H1/Hero: Poppins SemiBold 32px / 40px
H2/Section: Poppins SemiBold 24px / 32px
H3/Card: Poppins Medium 20px / 28px
Body/Default: Nunito Regular 16px / 24px
```

**Spacing System (8px base)**
```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
3xl: 64px
4xl: 96px
```

**Border Radius**
```
sm: 4px (inputs, tags)
md: 8px (buttons, cards)
lg: 16px (modals, large cards)
xl: 24px (hero sections)
full: 9999px (pills, avatars)
```

**Shadows**
```
sm: 0 1px 2px rgba(17, 78, 78, 0.05)
md: 0 4px 6px rgba(17, 78, 78, 0.1)
lg: 0 10px 15px rgba(17, 78, 78, 0.15)
xl: 0 20px 25px rgba(17, 78, 78, 0.2)
```

### 2.2 Component Library

**Must-Have Components:**

1. **Buttons**
   - Primary (Gold, full width + inline)
   - Secondary (Teal outline)
   - Ghost (text only)
   - States: default, hover, active, disabled, loading
   - Sizes: sm (32px), md (40px), lg (48px)

2. **Form Elements**
   - Text input (default, error, success, disabled)
   - Textarea (multi-line)
   - Select dropdown (native + custom)
   - Radio buttons (single select)
   - Checkboxes (multi-select)
   - Range slider (1-10 scale)
   - Toggle switch
   - File upload

3. **Cards**
   - Assessment question card
   - Career result card
   - Bursary opportunity card
   - Testimonial card
   - Stat card (with icon)

4. **Navigation**
   - Top navbar (desktop + mobile hamburger)
   - Progress stepper (assessment flow)
   - Breadcrumbs
   - Tab navigation
   - Footer (links + social)

5. **Feedback**
   - Toast notifications (success, error, info)
   - Modal dialogs (confirmation, info)
   - Loading spinner (mandala animation)
   - Progress bar (linear + circular)
   - Empty states
   - Error states

6. **Data Display**
   - Avatar (user profile)
   - Badge (status, count)
   - Tag (category, skill)
   - Tooltip
   - Accordion (FAQ)
   - Table (responsive)

7. **Brand Elements**
   - Mandala icon (multiple sizes)
   - Pattern overlays (circuit, sunburst, border)
   - Gradient backgrounds
   - Decorative dividers

### 2.3 Iconography

**Icon Set:** Lucide Icons (open source, matches brand aesthetic)

**Required Icons (24px, teal/gold):**
- Education: GraduationCap
- Bursaries: DollarSign, Award
- Career: Briefcase, TrendingUp
- Mentorship: Users, MessageCircle
- Assessment: ClipboardList, CheckCircle
- Navigation: Menu, X, ChevronRight, ChevronDown
- Actions: Plus, Edit, Trash, Download, Share
- Feedback: AlertCircle, CheckCircle, Info, XCircle

---

## 3. Screen Requirements

### 3.1 Landing Page (Homepage)

**Layout Sections:**

1. **Hero Section**
   - Full viewport height (100vh)
   - Background: Gradient overlay on mountain landscape image
   - Mandala pattern (subtle, top-right corner)
   - Headline: "Bridging Education to Employment" (H1, white)
   - Subheadline: "AI-powered career guidance for African youth" (Body/Large, cream)
   - CTA: "Start Your Journey" (Gold button, 56px height)
   - Trust indicator: "Join 10,000+ learners" (Caption, white)

2. **Problem Statement**
   - Cream background
   - 3-column grid (desktop) / stacked (mobile)
   - Icons + stats: "70% don't know career options", "R200k in missed bursaries", "1 in 3 unemployed"
   - Teal headers, brown body text

3. **How It Works**
   - White background
   - 4-step process (numbered circles with mandala motif)
   - Icons: Assessment → AI Analysis → Career Match → Action Plan
   - Gold accent lines connecting steps

4. **Features Grid**
   - Cream background
   - 2x3 grid (desktop) / stacked (mobile)
   - Cards: "20-Min Assessment", "AI Career Matching", "Bursary Database", "Mentorship Network", "Skills Gap Analysis", "Job Readiness"
   - Each card: Icon (teal), title (H3), description (Body/Small)

5. **Social Proof**
   - Teal background
   - Testimonial carousel (3 cards visible)
   - Student photo (circular), quote, name, school
   - Gold quotation marks

6. **CTA Section**
   - Gradient background (teal → green)
   - Centered: "Ready to discover your path?" (H2, white)
   - CTA: "Take the Assessment" (Gold button)

7. **Footer**
   - Brown background
   - Logo, tagline, social links
   - Legal: Privacy, Terms, Contact
   - Copyright: "© 2025 EduEasy x Thandi"

**Responsive Breakpoints:**
- Mobile: 320px - 767px (single column)
- Tablet: 768px - 1023px (2 columns)
- Desktop: 1024px+ (3-4 columns)

### 3.2 Assessment Flow (8 Screens)

**Screen 1: Welcome**
- Mandala hero image
- "Let's find your perfect career path" (H1)
- "20 questions, 15 minutes, life-changing insights" (Body)
- "Start Assessment" (Gold CTA)
- Progress: 0/20

**Screen 2-19: Question Screens**
- Sticky header: Logo + progress bar (teal fill)
- Question number: "Question 3 of 20" (Caption, teal)
- Question text: Large, readable (H2, brown)
- Answer options:
  - Multiple choice: Radio buttons (gold when selected)
  - Scale: 1-10 slider with emoji indicators
  - Text: Textarea (cream background, teal border on focus)
- Navigation: "Back" (ghost) + "Next" (gold, disabled until answered)
- Progress indicator: Circular percentage (bottom-right, mobile)

**Screen 20: Completion**
- Celebration animation (mandala burst)
- "You did it! 🎉" (H1)
- "Analyzing your responses..." (Body, with loading spinner)
- Auto-redirect to results (3 seconds)

### 3.3 Results Dashboard (3 Screens)

**Screen 1: Career Matches**
- Header: "Your Top 3 Career Paths" (H1)
- 3 large cards (stacked):
  - Career title (H2, teal)
  - Match score: 85% (circular progress, gold)
  - Icon (career-specific)
  - Description (Body, 2-3 sentences)
  - "Why this fits you" (expandable accordion)
  - CTA: "Explore Path" (gold button)
- Sidebar: "Your Strengths" (tags: Creative, Analytical, etc.)

**Screen 2: Action Plan**
- Timeline view (vertical, mobile-friendly)
- Phases: "Now", "3 Months", "6 Months", "1 Year"
- Each phase: Tasks (checkboxes), resources (links), milestones
- Progress tracker: "2 of 8 tasks completed"

**Screen 3: Bursary Matches**
- Filter bar: Field of study, amount, deadline
- Card grid (2 columns desktop, 1 mobile):
  - Bursary name (H3)
  - Amount: "R50,000/year" (gold, bold)
  - Deadline: "Closes 30 Nov" (orange if urgent)
  - Requirements: Tags (Grade 11, Math 60%+)
  - CTA: "Apply Now" (external link)

### 3.4 User Dashboard (2 Screens)

**Screen 1: Overview**
- Welcome banner: "Hi [Name]! 👋" (gradient background)
- Quick stats: Assessments taken, careers explored, applications started
- Recent activity feed
- Recommended actions (cards)

**Screen 2: Profile**
- Avatar upload (circular, 120px)
- Form fields: Name, email, phone, school, grade
- Preferences: Language (English, isiZulu, isiXhosa), notifications
- "Save Changes" (gold button)

### 3.5 Mobile-Specific Considerations

**Bottom Navigation (Mobile Only):**
- 4 tabs: Home, Assessment, Results, Profile
- Icons + labels
- Active state: Gold underline

**Gestures:**
- Swipe left/right for assessment questions
- Pull-to-refresh on dashboard
- Tap to expand accordions

---

## 4. Accessibility Requirements

### WCAG 2.1 AA Compliance

**Color Contrast:**
- Text on cream: Brown #5C3B20 (contrast ratio 7.2:1) ✓
- Text on teal: White #FFFFFF (contrast ratio 8.5:1) ✓
- Gold buttons: Brown text #5C3B20 (contrast ratio 4.8:1) ✓

**Interactive Elements:**
- Minimum touch target: 44x44px (mobile)
- Focus indicators: 2px teal outline on all interactive elements
- Keyboard navigation: Tab order follows visual flow

**Content:**
- Alt text for all images (include in Figma annotations)
- Form labels visible (not just placeholders)
- Error messages descriptive ("Email required" not "Error")

**Motion:**
- Respect prefers-reduced-motion (note in design specs)
- Animations optional, not critical to UX

---

## 5. Cultural Localization

### South African Context

**Language Support:**
- Primary: English (default)
- Secondary: isiZulu, isiXhosa (toggle in header)
- Text expansion: Allow 30% more space for translations

**Imagery:**
- Use diverse South African youth (ages 16-24)
- Settings: Townships, schools, urban/rural mix
- Avoid stereotypes, show aspiration + authenticity

**Content Tone:**
- Warm, encouraging (not corporate)
- Use local references: Matric, NSFAS, TVET colleges
- Avoid jargon, explain acronyms

**Data Sensitivity:**
- POPIA compliance notice (footer)
- Consent checkboxes (explicit, not pre-checked)
- "Why we ask this" tooltips on personal questions

---

## 6. Technical Specifications

### Export Requirements

**For No-Code Platforms:**

1. **Component Variants**
   - Use Figma variants for button states, card types
   - Name consistently: `Button/Primary/Default`, `Button/Primary/Hover`

2. **Auto Layout**
   - All components use Figma Auto Layout
   - Responsive resizing (hug, fill, fixed)
   - Padding/spacing uses 8px grid

3. **Assets**
   - Export icons as SVG (24x24px, 48x48px)
   - Export mandala as PNG (transparent, 512x512px)
   - Export patterns as repeatable SVG tiles
   - Export images as WebP (optimized, <200KB)

4. **Design Tokens**
   - Export color styles as CSS variables
   - Export text styles as Tailwind classes
   - Provide JSON file with all tokens

5. **Annotations**
   - Add notes for interactions (hover, click, scroll)
   - Specify animations (duration, easing)
   - Link screens for prototype flow

### Figma File Structure

```
📁 Thandi Design System
├── 📄 Cover (project overview)
├── 📄 Foundation
│   ├── Colors
│   ├── Typography
│   ├── Spacing
│   ├── Shadows
│   └── Grid System
├── 📄 Components
│   ├── Buttons
│   ├── Forms
│   ├── Cards
│   ├── Navigation
│   ├── Feedback
│   └── Brand Elements
├── 📄 Patterns
│   ├── Mandala Variations
│   ├── Circuit Pattern
│   └── Sunburst Pattern
├── 📄 Screens - Desktop
│   ├── Landing Page
│   ├── Assessment Flow
│   ├── Results Dashboard
│   └── User Dashboard
├── 📄 Screens - Mobile
│   └── (same structure)
└── 📄 Prototype
    └── Interactive flow (linked screens)
```

---

## 7. Deliverables Checklist

**Phase 1: Foundation (Week 1)**
- [ ] Color palette (styles created)
- [ ] Typography scale (text styles created)
- [ ] Spacing/grid system documented
- [ ] Icon library imported (Lucide)

**Phase 2: Components (Week 2)**
- [ ] 7 component categories built
- [ ] All variants created (hover, active, disabled)
- [ ] Auto Layout applied
- [ ] Component documentation

**Phase 3: Screens (Week 3)**
- [ ] 8 landing page sections (desktop + mobile)
- [ ] 20 assessment screens (desktop + mobile)
- [ ] 5 dashboard screens (desktop + mobile)
- [ ] Responsive breakpoints tested

**Phase 4: Prototype & Handoff (Week 4)**
- [ ] Interactive prototype (click-through)
- [ ] Annotations added (interactions, animations)
- [ ] Assets exported (SVG, PNG, WebP)
- [ ] Design tokens exported (JSON, CSS)
- [ ] Handoff document (implementation guide)

---

## 8. Implementation Notes for No-Code Builders

### Replit Agent / V0 / Bolt

**What to provide:**
1. Figma share link (view access)
2. Exported assets folder (ZIP)
3. Design tokens JSON file
4. Component mapping guide:
   ```
   Figma Component → Replit/V0 Component
   Button/Primary → <button className="btn-primary">
   Card/Career → <CareerCard {...props}>
   ```

**API Integration Points:**
- Assessment submit: `POST /api/assessment/submit`
- Results fetch: `GET /api/results/{userId}`
- Bursary search: `GET /api/bursaries?field={field}`

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://thandi-api.vercel.app
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 9. Success Metrics

**Design Quality:**
- Lighthouse score: 90+ (performance, accessibility)
- Mobile usability: 100% (Google test)
- Brand consistency: 100% (guideline adherence)

**User Experience:**
- Assessment completion rate: >70%
- Time to complete: <20 minutes
- Mobile traffic: >60% (optimize for mobile-first)

**Technical:**
- No-code implementation time: <2 days
- Zero custom code required
- Cross-browser compatible (Chrome, Safari, Firefox)

---

## 10. Timeline & Budget

**Estimated Timeline:**
- Foundation: 3-5 days
- Components: 5-7 days
- Screens: 7-10 days
- Prototype & Handoff: 2-3 days
- **Total: 3-4 weeks**

**Designer Profile:**
- Experience: Mid-senior (3+ years)
- Skills: Figma expert, design systems, responsive design
- Bonus: Familiarity with African design aesthetics

**Budget Range:**
- Freelance: $3,000 - $5,000 USD
- Agency: $8,000 - $12,000 USD
- In-house: 1 month sprint

---

## 11. References & Inspiration

**Design Systems:**
- Material Design 3 (component structure)
- Chakra UI (accessibility patterns)
- Radix UI (interaction states)

**Cultural References:**
- African beadwork patterns (Zulu, Xhosa)
- Kente cloth color blocking
- Adinkra symbols (wisdom, growth)

**Competitor Analysis:**
- Careers24 (SA job platform)
- MyFuture (Australian career tool)
- 80,000 Hours (career guidance)

---

## 12. Contact & Approval

**Stakeholders:**
- Product Owner: [Name]
- Brand Lead: [Name]
- Technical Lead: [Name]

**Approval Process:**
1. Foundation review (after Week 1)
2. Component review (after Week 2)
3. Screen review (after Week 3)
4. Final handoff (after Week 4)

**Feedback Channels:**
- Figma comments (preferred)
- Weekly sync meetings
- Slack: #thandi-design

---

**End of PRD**

*This document should be shared with the Figma designer along with the Thandi Brand Guidelines. Together, they provide everything needed to create a production-ready design system.*
