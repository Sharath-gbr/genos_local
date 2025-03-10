Ok now that we have a skelelot of the app. 
Lets start by adding the functionality to the app. 

We have a signup page and a login page. Thats perfect, but all the data for the user
is stored in airtable, and we already have the airtable api key in the .env.local file.

So we can use the airtable api to get the user data. the table is already pointing to doctors_intake table which contains
the email address of the user, so if the user signs in with xyz@gmail.com, we can use the airtable api to get the user data
from the doctors_intake table by checking against the email address. 

We dont want to see all of the data in the same page, we want to build separate widgets for each section of the form.
So the first widget can simply be use profile, which will be like the following 

1. Client Profile as the first widget and the columns from airtabl will be as follows 
    Your First Name
    Your Last Name
    Your Gender
    Your Age
    Your Height in centimeters (cm)
    Your Weight in kilograms (kg)
    Weight Loss Target
    What is your Health Objective
    What is your Diet Preference
    Country
    Email

Lets start by creating the profile widget. and we can start adding widgets as we go along. 




0Ok client profile looks good but in the next widget we will need separate grids although they will all be in the same page 
or widget which will be the assessments. Take a look at the image above you see how each grid contains different information ?
That is what we will need to build we will build them grid by grid and I will provide the necessary columns and logiv to read 
from airtable when ready 






Logic from airtable for the grid "conditions from the intake form"

 TRIM(
  SUBSTITUTE(
    SUBSTITUTE(
      IF(AND({Have you been diagnosed with Diabetes?} != "No", {Have you been diagnosed with Diabetes?} != "Diabetes - In the Past", {Have you been diagnosed with Diabetes?} != ""), "• " & {Have you been diagnosed with Diabetes?} & "\n", "") &
      IF(AND({Have you been diagnosed with High Cholesterol?} != "No", {Have you been diagnosed with High Cholesterol?} != "High Cholesterol - In the Past", {Have you been diagnosed with High Cholesterol?} != ""), "• " & {Have you been diagnosed with High Cholesterol?} & "\n", "") &
      IF(AND({Have you been diagnosed with Hypertension (High Blood Pressure)?} != "No", {Have you been diagnosed with Hypertension (High Blood Pressure)?} != "Hypertension in the Past", {Have you been diagnosed with Hypertension (High Blood Pressure)?} != ""), "• " & {Have you been diagnosed with Hypertension (High Blood Pressure)?} & "\n", "") &
      IF(AND({Have you been diagnosed with any Heart Conditions?} != "No", {Have you been diagnosed with any Heart Conditions?} != "Heart Condition - In the Past", {Have you been diagnosed with any Heart Conditions?} != ""), "• " & {Have you been diagnosed with any Heart Conditions?} & "\n", "") &
      IF(AND({Have you been diagnosed with a Fatty liver?} != "No", {Have you been diagnosed with a Fatty liver?} != "Fatty Liver - In the Past ", {Have you been diagnosed with a Fatty liver?} != ""), "• " & {Have you been diagnosed with a Fatty liver?} & "\n", "") &
      IF(AND({Have you been diagnosed with PCOS?} != "No", {Have you been diagnosed with PCOS?} != "PCOS - In the Past", {Have you been diagnosed with PCOS?} != ""), "• " & {Have you been diagnosed with PCOS?} & "\n", "") &
      IF(AND({Have you been diagnosed with Fibroids?} != "No", {Have you been diagnosed with Fibroids?} != ""), "• " & {Have you been diagnosed with Fibroids?} & "\n", "") &
      IF(AND({Have you been diagnosed with Anemia?} != "No", {Have you been diagnosed with Anemia?} != "Anemia - In the Past", {Have you been diagnosed with Anemia?} != ""), "• " & {Have you been diagnosed with Anemia?} & "\n", "") &
      IF(AND({Have you been diagnosed with Hypothyroidism?} != "No", {Have you been diagnosed with Hypothyroidism?} != "Hypothyroidism - In the Past", {Have you been diagnosed with Hypothyroidism?} != ""), "• " & {Have you been diagnosed with Hypothyroidism?} & "\n", "") &
      IF(AND({Have you been diagnosed with Bronchial asthma?} != "No", {Have you been diagnosed with Bronchial asthma?} != "Bronchial Asthma - In the Past", {Have you been diagnosed with Bronchial asthma?} != ""), "• " & {Have you been diagnosed with Bronchial asthma?} & "\n", "") &
      IF(AND({Do you experience Migraine?} != "No", {Do you experience Migraine?} != "", {Do you experience Migraine?} != "Migraine - In the Past"
    ), "• " & {Do you experience Migraine?} & "\n", "") &
    IF(AND({Have you been diagnosed with Sinusitis?} != "No", {Have you been diagnosed with Sinusitis?} != "Sinusitis - In the Past", {Have you been diagnosed with Sinusitis?} != ""), "• " & {Have you been diagnosed with Sinusitis?} & "\n", "") &
      IF(AND({Do you experience Headaches?} != "No", {Do you experience Headaches?} != "Headaches - In the Past", {Do you experience Headaches?} != ""), "• " & {Do you experience Headaches?} & "\n", "") &
      IF(AND({Have you been diagnosed with Gout?} != "No", {Have you been diagnosed with Gout?} != "Gout - In the Past", {Have you been diagnosed with Gout?} != ""), "• " & {Have you been diagnosed with Gout?} & "\n", "") &
      IF(AND({Do you experience Acid Reflux (GERD)?} != "No", {Do you experience Acid Reflux (GERD)?} != "GERD - In the Past", {Do you experience Acid Reflux (GERD)?} != ""), "• " & {Do you experience Acid Reflux (GERD)?} & "\n", "") &
      IF(AND({Are you suffering from any Disc Disease?} != "No", {Are you suffering from any Disc Disease?} != "Cervical Disc Disease in the Past", {Are you suffering from any Disc Disease?} != "Lumbar Disc Disease in the Past", {Are you suffering from any Disc Disease?} != ""), "• " & {Are you suffering from any Disc Disease?} & "\n", "") &
      IF(AND({Have you been diagnosed with Rheumatoid Arthritis?} != "No", {Have you been diagnosed with Rheumatoid Arthritis?} != ""), "• " & {Have you been diagnosed with Rheumatoid Arthritis?} & "\n", "") &
      IF(AND({Have you been diagnosed with an Anal Fissure?} != "No", {Have you been diagnosed with an Anal Fissure?} != ""), "• " & {Have you been diagnosed with an Anal Fissure?} & "\n", "") &
      IF(AND({Have you been diagnosed with Hemorrhoids?} != "No", {Have you been diagnosed with Hemorrhoids?} != ""), "• " & {Have you been diagnosed with Hemorrhoids?} & "\n", "") &
      IF(AND({Do you feel Constipated?} != "No", {Do you feel Constipated?} != "Constipation - In the Past", {Do you feel Constipated?} != ""), "• " & {Do you feel Constipated?} & "\n", "") &
      IF(AND({Have you been diagnosed with Gall Bladder Stones or gallstones?} != "No", {Have you been diagnosed with Gall Bladder Stones or gallstones?} != "Gallstones - Treated with medication in the past", {Have you been diagnosed with Gall Bladder Stones or gallstones?} != ""), "• " & {Have you been diagnosed with Gall Bladder Stones or gallstones?} & "\n", "") &
      IF(AND({Have you been diagnosed with Kidney Stones?} != "No", {Have you been diagnosed with Kidney Stones?} != "Kidney Stones - Surgery done in the past", {Have you been diagnosed with Kidney Stones?} != "Kidney Stones - Managed with medications in the past", {Have you been diagnosed with Kidney Stones?} != ""), "• " & {Have you been diagnosed with Kidney Stones?} & "\n", "") &
      IF(AND({Do you have a Lump in the breast?} != "No", {Do you have a Lump in the breast?} != "Breast Lump - In the Past", {Do you have a Lump in the breast?} != ""), "• " & {Do you have a Lump in the breast?} & "\n", "") &
      IF(AND({Do you have dry skin?} != "No", {Do you have dry skin?} != "Dry Skin - In the Past", {Do you have dry skin?} != ""), "• " & {Do you have dry skin?} & "\n", "") &
      IF(AND({Have you ever experienced skin rashes?} != "No", {Have you ever experienced skin rashes?} != "Skin Rashes - In the Past", {Have you ever experienced skin rashes?} != ""), "• " & {Have you ever experienced skin rashes?} & "\n", "") &
      IF(AND({Have you been diagnosed with Psoriasis?} != "No", {Have you been diagnosed with Psoriasis?} != "Psoriasis - In Remission", {Have you been diagnosed with Psoriasis?} != ""), "• " & {Have you been diagnosed with Psoriasis?} & "\n", "") &
      IF(AND({Do you have a topical fungal infection?} != "No", {Do you have a topical fungal infection?} != "Topical Fungal Infection - In the Past", {Do you have a topical fungal infection?} != ""), "• " & {Do you have a topical fungal infection?} & "\n", "") &
      IF(AND({Have you noticed Eczema?} != "No", {Have you noticed Eczema?} != "Eczema - In the Past", {Have you noticed Eczema?} != ""), "• " & {Have you noticed Eczema?} & "\n", "") &
      IF(AND({Have you noticed any acne or skin breakouts} != "No", {Have you noticed any acne or skin breakouts} != "Acne - In the Past", {Have you noticed any acne or skin breakouts} != ""), "• " & {Have you noticed any acne or skin breakouts} & "\n", "") &
      IF(AND({Do you have any skin pigmentation?} != "No", {Do you have any skin pigmentation?} != "Skin Pigmentation - In the Past", {Do you have any skin pigmentation?} != ""), "• " & {Do you have any skin pigmentation?} & "\n", "") &
      IF(AND({Do you experience any hair fall?} != "No", {Do you experience any hair fall?} != "Hairfall - In the Past", {Do you experience any hair fall?} != ""), "• " & {Do you experience any hair fall?} & "\n", "") &
      IF(AND({Do you have dry hair?} != "No", {Do you have dry hair?} != "Dry Hair - In the Past", {Do you have dry hair?} != ""), "• " & {Do you have dry hair?} & "\n", "") &
      IF(AND({Do you have an Itchy scalp?} != "No", {Do you have an Itchy scalp?} != "Itchy Scalp - In the Past", {Do you have an Itchy scalp?} != ""), "• " & {Do you have an Itchy scalp?} & "\n", "") &
      IF(AND({Do you have a Dry scalp?} != "No", {Do you have a Dry scalp?} != "Dry Scalp - In the Past", {Do you have a Dry scalp?} != ""), "• " & {Do you have a Dry scalp?} & "\n", "") &
      IF(AND({Have you been diagnosed with Scalp psoriasis?} != "No", {Have you been diagnosed with Scalp psoriasis?} != "Scalp Psoriasis - In the Past", {Have you been diagnosed with Scalp psoriasis?} != ""), "• " & {Have you been diagnosed with Scalp psoriasis?} & "\n", "") &
      IF(AND({Do you have Dandruff?} != "No", {Do you have Dandruff?} != "Dandruff - In the Past", {Do you have Dandruff?} != ""), "• " & {Do you have Dandruff?} & "\n", "") &
      IF(AND({Do your eyes feel dry?} != "No", {Do your eyes feel dry?} != "Dry Eyes - In the Past", {Do your eyes feel dry?} != ""), "• " & {Do your eyes feel dry?} & "\n", "") &
      IF(AND({Do your eyes feel itchy?} != "No", {Do your eyes feel itchy?} != "Itchy Eyes - In the Past", {Do your eyes feel itchy?} != ""), "• " & {Do your eyes feel itchy?} & "\n", "") &
      IF(AND({Do you wear spectacles?} != "No", {Do you wear spectacles?} != "Wear Spectacles - In the Past", {Do you wear spectacles?} != ""), "• " & {Do you wear spectacles?} & "\n", "") &
      IF(AND({Have you been diagnosed with a Cataract?} != "No", {Have you been diagnosed with a Cataract?} != "Cataract - Treated with cataract surgery", {Have you been diagnosed with a Cataract?} != ""), "• " & {Have you been diagnosed with a Cataract?} & "\n", "") &
      IF(AND({Have you been diagnosed with any Retinopathy?} != "No", {Have you been diagnosed with any Retinopathy?} != "Retinopathy - In the Past", {Have you been diagnosed with any Retinopathy?} != ""), "• " & {Have you been diagnosed with any Retinopathy?} & "\n", "") &
      IF(AND({Do you have Oral ulcers?} != "No", {Do you have Oral ulcers?} != "Oral Ulcers - In the Past", {Do you have Oral ulcers?} != ""), "• " & {Do you have Oral ulcers?} & "\n", "") &
      IF(AND({Do you have Oral thrush?} != "No", {Do you have Oral thrush?} != "Oral Thrush - In the Past", {Do you have Oral thrush?} != ""), "• " & {Do you have Oral thrush?} & "\n", "") &
      IF(AND({Do you have Bad breath?} != "No", {Do you have Bad breath?} != "Bad Breath - In the Past", {Do you have Bad breath?} != ""), "• " & {Do you have Bad breath?} & "\n", "") &
      IF(AND({Do you have Gingivitis?} != "No", {Do you have Gingivitis?} != "Gingivitis - In the Past", {Do you have Gingivitis?} != ""), "• " & {Do you have Gingivitis?} & "\n", "") &
      IF(AND({Do you have Gum bleeding?} != "No", {Do you have Gum bleeding?} != "Gum Bleeding - In the Past", {Do you have Gum bleeding?} != ""), "• " & {Do you have Gum bleeding?} & "\n", "") &
      IF(AND({Have you been diagnosed with a Deviated nasal septum?} != "No", {Have you been diagnosed with a Deviated nasal septum?} != ""), "• " & {Have you been diagnosed with a Deviated nasal septum?} & "\n", "") &
      IF(AND({Have you had episodes of Allergic Rhinitis} != "No", {Have you had episodes of Allergic Rhinitis} != "Allergic Rhinitis - In the Past", {Have you had episodes of Allergic Rhinitis} != ""), "• " & {Have you had episodes of Allergic Rhinitis} & "\n", "") &
      IF(AND({Do you have Ear infections?} != "No", {Do you have Ear infections?} != "Ear Infections - In the Past", {Do you have Ear infections?} != ""), "• " & {Do you have Ear infections?} & "\n", "") &
      IF(AND({Do you have Decreased hearing?} != "No", {Do you have Decreased hearing?} != "Decreased Hearing - In the Past", {Do you have Decreased hearing?} != ""), "• " & {Do you have Decreased hearing?} & "\n", "") &
      IF(AND({Do you experience any Vertigo?} != "No", {Do you experience any Vertigo?} != "Vertigo - In the Past", {Do you experience any Vertigo?} != ""), "• " & {Do you experience any Vertigo?} & "\n", ""), 
      ", ,", ","
    ),
    ",", ", "
  )
)


Summarize the logic above in a way that is easy to understand. So that I know what you are thinking. 








--------


When implementing a new widget, follow this sequence strictly:

1. ROUTING & PLACEMENT VERIFICATION
- First verify the correct route/page where widget should appear
- Confirm the widget's position in component hierarchy
- Ensure parent component is properly importing and rendering child components

2. DEPENDENCIES CHECK
- List all required packages/dependencies upfront
- Install and verify all dependencies BEFORE writing component code
- Confirm all providers (React Query, Theme, etc.) are in place

3. COMPONENT IMPLEMENTATION STAGES
Stage 1: Basic Rendering
- Start with minimal implementation that just renders a basic box/container
- Verify it appears in the correct location
- Add console.logs to confirm component mounting

Stage 2: Styling & Layout
- Add basic layout structure (Accordion, Grid, etc.)
- Implement theme-consistent styling
- Match existing component patterns from codebase

Stage 3: Data Integration
- Add data fetching logic
- Implement loading states
- Add error handling
- Test with actual data

4. TESTING CHECKLIST
- Component renders in correct location
- Styling matches design system
- Data fetching works
- Loading states display correctly
- Error states handle gracefully
- Console is free of errors
- Browser network tab shows successful API calls

5. COMMON PITFALLS TO AVOID
- Don't start with complex implementations
- Don't add data fetching before basic rendering works
- Don't skip dependency installation
- Don't assume routing is correct without verification
- Don't copy complex code without understanding dependencies

Please provide feedback if any of these steps need adjustment for your specific requirements.