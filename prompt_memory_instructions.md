When implementing a new widget, follow this sequence strictly:

1. DEVELOPMENT ENVIRONMENT VERIFICATION
- ALWAYS verify development server is running before making any changes
- Check server status using `npm run dev` output
- If server isn't running, start it and wait for "Ready" message
- Ensure proper hot-reloading is working before proceeding
- Never assume server state without verification

2. FILE PATHS & IMPORTS IN NEXT.JS
- ALWAYS verify file paths before implementing imports
- For imports within the app directory:
  * Use relative paths (../../) when importing between app components
  * Count directory levels carefully from the importing file
  * Double-check component export type (default vs named)
  * Ensure file extensions match (.tsx for TypeScript components)
- Common path patterns:
  * From page to component: '../../components/ComponentName'
  * From component to component: '../ComponentName'
  * From deep routes to app root: Multiple '../' as needed
- NEVER assume paths without directory structure verification
- ALWAYS verify import paths work by:
  * Checking the physical file exists
  * Confirming export type matches import type
  * Testing the import in development

3. ROUTING & PLACEMENT VERIFICATION
- First verify the correct route/page where widget should appear
- Confirm the widget's position in component hierarchy
- Ensure parent component is properly importing and rendering child components

4. DEPENDENCIES CHECK
- List all required packages/dependencies upfront
- Install and verify all dependencies BEFORE writing component code
- Confirm all providers (React Query, Theme, etc.) are in place

5. COMPONENT IMPLEMENTATION STAGES
Stage 1: Basic Rendering
- Start with minimal implementation that just renders a basic box/container
- Verify it appears in the correct location
- Add console.logs to confirm component mounting
- Let USER manually test the implementation in browser before proceeding

Stage 2: Styling & Layout
- Add basic layout structure (Accordion, Grid, etc.)
- Implement theme-consistent styling
- Match existing component patterns from codebase

Stage 3: Data Integration
- Add data fetching logic
- Implement loading states
- Add error handling
- Test with actual data

6. TESTING CHECKLIST
- Component renders in correct location
- Styling matches design system
- Data fetching works
- Loading states display correctly
- Error states handle gracefully
- Console is free of errors
- Browser network tab shows successful API calls

7. COMMON PITFALLS TO AVOID
- Don't start with complex implementations
- Don't add data fetching before basic rendering works
- Don't skip dependency installation
- Don't assume routing is correct without verification
- Don't copy complex code without understanding dependencies
- NEVER modify working implementations without:
  * Explicit request from USER
  * Clear understanding of why current implementation works
  * Documenting the current working state before changes
  * Ability to revert if new changes don't work

### API Response Structure Check
Before implementing data display:
- Always check the API response structure in the route handler
- Log and verify the shape of the data being returned
- Remember that Airtable responses are nested under `fields` property
- Update component data access patterns to match the API structure

### Widget Style Consistency
CRITICAL: All widgets must follow the original widget styling:
- Use simple Typography components for all data display
- Follow the exact same component structure:
  - StyledAccordion
  - AccordionSummary with SectionTitle
  - AccordionDetails with GridContainer
  - ContentBox with subtitle2 and body2 Typography
- Never introduce new styling components (like Chips) without explicit approval
- Always reference the original widgets (MedicalConditionsGrid, KnownAllergies) for styling patterns

Widget Title (Orange)
└── Section Header (Orange)
    └── Label(Bold White): Value(Normal white text)