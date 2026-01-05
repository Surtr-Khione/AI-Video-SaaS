#!/usr/bin/env python3
"""
Airtable Weekly Scraper
Scrapes Airtable table every Monday morning and saves the data.
"""

import os
import json
import schedule
import time
from datetime import datetime
from pyairtable import Api
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
AIRTABLE_API_KEY = os.getenv('AIRTABLE_API_KEY')
AIRTABLE_BASE_ID = os.getenv('AIRTABLE_BASE_ID')
AIRTABLE_TABLE_NAME = os.getenv('AIRTABLE_TABLE_NAME')
OUTPUT_DIR = os.getenv('OUTPUT_DIR', 'data')


def scrape_airtable():
    """Fetch all records from the Airtable table."""
    try:
        print(f"[{datetime.now()}] Starting Airtable scrape...")

        # Initialize Airtable API
        api = Api(AIRTABLE_API_KEY)
        table = api.table(AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME)

        # Fetch all records
        records = table.all()

        print(f"Successfully fetched {len(records)} records")

        # Save to file
        save_data(records)

        print(f"[{datetime.now()}] Scrape completed successfully")

    except Exception as e:
        print(f"[{datetime.now()}] Error scraping Airtable: {e}")


def save_data(records):
    """Save scraped data to JSON file."""
    # Create output directory if it doesn't exist
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Generate filename with timestamp
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"{OUTPUT_DIR}/airtable_data_{timestamp}.json"

    # Save records to JSON file
    with open(filename, 'w') as f:
        json.dump(records, f, indent=2)

    print(f"Data saved to {filename}")


def run_scheduler():
    """Run the scheduler to execute scraping every Monday at 9:00 AM."""
    # Schedule the job for every Monday at 9:00 AM
    schedule.every().monday.at("09:00").do(scrape_airtable)

    print("Scheduler started. Waiting for Monday 9:00 AM...")
    print("Press Ctrl+C to exit")

    # Keep the script running
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute


if __name__ == "__main__":
    # Validate configuration
    if not all([AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME]):
        print("Error: Missing required environment variables")
        print("Please set AIRTABLE_API_KEY, AIRTABLE_BASE_ID, and AIRTABLE_TABLE_NAME")
        exit(1)

    # Run immediately on first start (optional - comment out if not needed)
    print("Running initial scrape...")
    scrape_airtable()

    # Start scheduler
    run_scheduler()
