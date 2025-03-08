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




Client profile widget looks good. lets start the 













