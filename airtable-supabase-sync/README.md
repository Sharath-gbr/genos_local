# Airtable to Supabase Sync

A Python utility to sync data from Airtable to Supabase, specifically designed for the Genos App weight logs data.

## Features

- Incremental sync - only transfers new or updated records
- Batched processing to handle API rate limits
- Error handling and logging
- Configurable via environment variables
- Tracks sync status in Supabase
- **Email mapping** - Links Airtable emails with authentication emails

## Setup

### Prerequisites

- Python 3.9 or higher
- Airtable API key and Base ID
- Supabase URL and service role key

### Installation

1. Clone this repository
2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Create a `.env` file by copying the example:
   ```
   cp .env.example .env
   ```
5. Edit the `.env` file with your credentials

### Database Setup

Before running the sync, you need to set up the required database tables in Supabase:

```
python migrations.py
```

This will create:
- `user_mappings` table - Stores the mapping between Airtable emails and Auth emails
- `sync_metadata` table - Tracks when the last sync occurred
- Proper Row Level Security (RLS) policies for data access

## Usage

### Manual Sync

Run the sync script manually:

```
python sync.py
```

During sync, the script will:
1. Fetch records from Airtable
2. Create automatic email mappings for exact matches
3. Sync all data to Supabase

### Understanding Email Mapping

The sync process solves the issue of mismatched emails between Airtable and the authentication system:

1. When a user signs up with email A, but their Airtable data is under email B
2. The `user_mappings` table creates a link between these emails
3. When fetching data, the app will check both the auth email directly and any mapped emails

Email mappings are created in two ways:
- **Automatic mapping**: When Airtable email matches auth email exactly
- **Manual mapping**: For cases where emails don't match, you'll need to create entries in the `user_mappings` table

### Scheduled Sync

#### Using Cron (Linux/macOS)

Add to crontab to run daily:

```
0 0 * * * cd /path/to/airtable-supabase-sync && /path/to/venv/bin/python sync.py >> /path/to/logfile.log 2>&1
```

#### Using Task Scheduler (Windows)

Create a scheduled task that runs:

```
C:\path\to\venv\Scripts\python.exe C:\path\to\airtable-supabase-sync\sync.py
```

### GitHub Actions

To run the sync using GitHub Actions:

1. Push this repository to GitHub
2. Set up the required secrets in your GitHub repository
3. Create a workflow file at `.github/workflows/sync.yml`:

```yaml
name: Sync Airtable to Supabase

on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC
  workflow_dispatch:     # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Setup database
        run: python migrations.py
      - name: Run sync
        run: python sync.py
        env:
          AIRTABLE_API_KEY: ${{ secrets.AIRTABLE_API_KEY }}
          AIRTABLE_BASE_ID: ${{ secrets.AIRTABLE_BASE_ID }}
          AIRTABLE_TABLE_NAME: ${{ secrets.AIRTABLE_TABLE_NAME }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
```

## Managing Email Mappings Manually

For emails that don't match exactly, you need to create manual mappings:

### Using Supabase Dashboard

1. Go to Supabase Dashboard > Table Editor > user_mappings
2. Add a new row with:
   - `airtable_email`: The email used in Airtable
   - `auth_email`: The email the user logs in with
   - `auto_matched`: Set to false for manual mappings

### Using SQL

```sql
INSERT INTO user_mappings (airtable_email, auth_email, auto_matched)
VALUES ('user@airtable-email.com', 'user@login-email.com', false);
```

## Troubleshooting

### Common Issues

- **Authentication Errors**: Verify your API keys and credentials in the `.env` file
- **Rate Limiting**: If you encounter rate limit errors, increase the sleep time between batches
- **Field Mapping**: Ensure the field names in `transform_airtable_record()` match your Airtable schema
- **Email Mapping Issues**: Check the console logs in the FoodSensitivityWidget to see if mappings are being used correctly

### Logs

The script logs to standard output. Redirect to a file if needed:

```
python sync.py > sync_log.txt
```

## License

MIT 