# Recipe Generator Implementation Guide

## Implementation Sequence

### 1. Initial Setup & Routing
- First, identify where in GENO-APP's navigation structure the recipe generator should live
- Create a new route for the recipe generator component
- Follow the existing routing patterns in GENO-APP

### 2. Airtable Integration
- Since you're using the same Airtable base, you'll need to:
- Add the recipe table name to your environment variables
- Create a new API route handler specifically for recipe data
- Ensure you adapt the data structure to match GENO-APP's expected format (noting that Airtable responses are nested under `fields`)

### 3. Component Implementation
Following the strict widget implementation sequence:

Stage 1: Basic Structure
```typescript
import { StyledAccordion, AccordionSummary, AccordionDetails } from '../styled/Accordion';
import { GridContainer } from '../styled/Grid';
import { ContentBox } from '../styled/ContentBox';
import { Typography } from '@mui/material';

export function RecipeGenerator() {
  return (
    <StyledAccordion>
      <AccordionSummary>
        <Typography variant="sectionTitle">Recipe Generator</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <GridContainer>
          <ContentBox>
            {/* Initial basic structure following GENO-APP patterns */}
          </ContentBox>
        </GridContainer>
      </AccordionDetails>
    </StyledAccordion>
  );
}
```

### 4. Data Migration Steps
API Route Handler Setup:
```typescript
import { getAirtableRecords } from '@/lib/airtable';

export async function GET() {
  try {
    const records = await getAirtableRecords('Recipes'); // Your recipe table name
    return Response.json({ data: records });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch recipes' }, { status: 500 });
  }
}
```

### 5. Key Considerations
- Stick to GENO-APP's existing styling patterns
- Use the same error handling and loading state patterns
- Follow the exact component hierarchy shown in the instructions
- Use Typography components for all text display
- Avoid introducing new styling components without approval

### 6. Testing Checklist
- Verify the component renders in the correct location
- Confirm data fetching works with the new API route
- Check that styling matches existing GENO-APP widgets
- Test loading and error states
- Verify console is free of errors
- Check network calls in browser dev tools