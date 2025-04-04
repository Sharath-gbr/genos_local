# Airtable to Supabase Sync

Automated sync utility for transferring weight logs data from Airtable to Supabase, with support for email mapping between systems.

## Setup Instructions

1. **Database Setup**
   
   Run the table creation script in your Supabase SQL editor:
   ```bash
   # Copy the contents of setup_tables.sql and run in Supabase SQL Editor
   ```

2. **Environment Setup**

   ```bash
   # Clone the repository
   git clone <your-repo-url>
   cd <your-repo-directory>

   # Create and activate virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate

   # Install dependencies
   pip install -r requirements.txt

   # Set up environment variables
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Environment Variables**

   Edit your `.env` file with the following:
   - `AIRTABLE_API_KEY`: Your Airtable API key
   - `AIRTABLE_BASE_ID`: Your Airtable base ID
   - `AIRTABLE_TABLE_NAME`: The name of your Airtable table (default: "Weight Logs")
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_KEY`: Your Supabase service role key (required for RLS bypass)

## Usage

### Manual Sync

Run the sync script:
```bash
python fixed_sync.py
```

### Automated Sync (Cron)

Add to crontab to run daily:
```bash
0 0 * * * cd /path/to/sync && /path/to/venv/bin/python fixed_sync.py >> /path/to/sync.log 2>&1
```

### Automated Sync (GitHub Actions)

Create `.github/workflows/sync.yml`:
```yaml
name: Sync Airtable to Supabase

on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC
  workflow_dispatch:      # Manual trigger

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
      - name: Run sync
        run: python fixed_sync.py
        env:
          AIRTABLE_API_KEY: ${{ secrets.AIRTABLE_API_KEY }}
          AIRTABLE_BASE_ID: ${{ secrets.AIRTABLE_BASE_ID }}
          AIRTABLE_TABLE_NAME: ${{ secrets.AIRTABLE_TABLE_NAME }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
```

## Features

- **Automatic Email Mapping**: Automatically maps emails when they match exactly between systems
- **List Email Handling**: Properly handles cases where Airtable returns emails as lists
- **Incremental Sync**: Only syncs new or updated records since last sync
- **Row Level Security**: Ensures users can only access their own data
- **Batched Processing**: Handles API rate limits gracefully
- **Detailed Logging**: Comprehensive logging for troubleshooting

## Troubleshooting

### Common Issues

1. **Permission Denied**
   - Ensure you're using a service role key for Supabase
   - Verify RLS policies are correctly set up

2. **Email Mapping Issues**
   - Check the logs for any email processing errors
   - Verify email formats in Airtable data

3. **Rate Limiting**
   - The script includes built-in rate limiting
   - Adjust `BATCH_SIZE` and sleep times if needed

### Logs

Check the logs for detailed information about the sync process:
```bash
tail -f /path/to/sync.log
```
