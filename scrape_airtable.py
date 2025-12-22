#!/usr/bin/env python3
"""
Airtable Scraper - Scrapes data from Airtable shared views or API
Supports multiple scraping methods with deduplication and date filtering
"""

import json
import os
import time
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import argparse

# Method 1: Using Selenium (for shared views that require JavaScript)
try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.chrome.options import Options
    from selenium.common.exceptions import TimeoutException
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False
    print("Warning: Selenium not available. Install with: pip install selenium")

# Method 2: Using Airtable API (requires API key)
try:
    from pyairtable import Api
    PYAIRTABLE_AVAILABLE = True
except ImportError:
    PYAIRTABLE_AVAILABLE = False
    print("Warning: pyairtable not available. Install with: pip install pyairtable")

# Method 3: Using requests for direct API calls
try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False


class AirtableScraper:
    """Scrapes Airtable tables with deduplication and date filtering"""

    def __init__(self, url: str, api_key: Optional[str] = None):
        """
        Initialize the scraper

        Args:
            url: Airtable URL (shared view or table)
            api_key: Optional API key for Airtable API access
        """
        self.url = url
        self.api_key = api_key or os.getenv('AIRTABLE_API_KEY')
        self.data = []

        # Parse URL to extract IDs
        self.app_id, self.view_id, self.table_id = self._parse_url(url)

    def _parse_url(self, url: str) -> tuple:
        """Extract app ID, view ID, and table ID from Airtable URL"""
        parts = url.rstrip('/').split('/')
        app_id = None
        view_id = None
        table_id = None

        for part in parts:
            if part.startswith('app'):
                app_id = part
            elif part.startswith('shr'):
                view_id = part
            elif part.startswith('tbl'):
                table_id = part

        return app_id, view_id, table_id

    def scrape_with_selenium(self, headless: bool = True, wait_time: int = 10) -> List[Dict]:
        """
        Scrape using Selenium (for shared views)

        Args:
            headless: Run browser in headless mode
            wait_time: Maximum time to wait for page load (seconds)

        Returns:
            List of dictionaries containing row data
        """
        if not SELENIUM_AVAILABLE:
            raise ImportError("Selenium not installed. Run: pip install selenium")

        print(f"Scraping with Selenium (headless={headless})...")

        chrome_options = Options()
        if headless:
            chrome_options.add_argument("--headless")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")

        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")

        driver = webdriver.Chrome(options=chrome_options)
        data = []

        try:
            driver.get(self.url)
            print("Page loaded, waiting for content...")

            # Wait for the table to load
            wait = WebDriverWait(driver, wait_time)

            # Try different selectors that Airtable might use
            selectors = [
                (By.CSS_SELECTOR, "div[role='row']"),
                (By.CSS_SELECTOR, "div[data-tutorial-selector-id='grid-row']"),
                (By.CSS_SELECTOR, ".cell"),
                (By.TAG_NAME, "table"),
            ]

            element_found = False
            for by, selector in selectors:
                try:
                    wait.until(EC.presence_of_element_located((by, selector)))
                    print(f"Found elements with selector: {selector}")
                    element_found = True
                    break
                except TimeoutException:
                    continue

            if not element_found:
                print("Warning: Could not find table elements. Saving page source for debugging...")
                with open('airtable_page_source.html', 'w', encoding='utf-8') as f:
                    f.write(driver.page_source)

            # Give extra time for dynamic content
            time.sleep(3)

            # Try to extract table data
            # Method 1: Look for rows
            rows = driver.find_elements(By.CSS_SELECTOR, "div[role='row']")
            if rows:
                print(f"Found {len(rows)} rows")
                headers = []

                # Get headers from first row
                if rows:
                    header_cells = rows[0].find_elements(By.CSS_SELECTOR, "div[role='columnheader'], div[role='gridcell']")
                    headers = [cell.text.strip() for cell in header_cells if cell.text.strip()]

                # Get data from subsequent rows
                for row in rows[1:]:
                    cells = row.find_elements(By.CSS_SELECTOR, "div[role='gridcell']")
                    row_data = {}

                    for idx, cell in enumerate(cells):
                        header = headers[idx] if idx < len(headers) else f"Column_{idx}"
                        row_data[header] = cell.text.strip()

                    if row_data:
                        data.append(row_data)

            # Method 2: Try to find any table elements
            if not data:
                print("Trying alternative extraction method...")
                tables = driver.find_elements(By.TAG_NAME, "table")
                for table in tables:
                    headers = [th.text.strip() for th in table.find_elements(By.TAG_NAME, "th")]
                    rows = table.find_elements(By.TAG_NAME, "tr")

                    for row in rows[1:]:  # Skip header row
                        cells = row.find_elements(By.TAG_NAME, "td")
                        row_data = {}
                        for idx, cell in enumerate(cells):
                            header = headers[idx] if idx < len(headers) else f"Column_{idx}"
                            row_data[header] = cell.text.strip()
                        if row_data:
                            data.append(row_data)

            print(f"Extracted {len(data)} rows")

        except Exception as e:
            print(f"Error during scraping: {e}")
            # Save screenshot for debugging
            try:
                driver.save_screenshot('airtable_error_screenshot.png')
                print("Saved error screenshot to airtable_error_screenshot.png")
            except:
                pass

        finally:
            driver.quit()

        self.data = data
        return data

    def scrape_with_api(self, base_id: Optional[str] = None,
                        table_name: Optional[str] = None) -> List[Dict]:
        """
        Scrape using Airtable API

        Args:
            base_id: Base ID (defaults to app_id from URL)
            table_name: Table name or ID (defaults to table_id from URL)

        Returns:
            List of dictionaries containing row data
        """
        if not self.api_key:
            raise ValueError("API key required. Set AIRTABLE_API_KEY environment variable or pass api_key parameter")

        if not PYAIRTABLE_AVAILABLE:
            print("pyairtable not available, using requests...")
            return self._scrape_with_requests_api(base_id, table_name)

        base_id = base_id or self.app_id
        table_name = table_name or self.table_id

        print(f"Scraping with Airtable API (base: {base_id}, table: {table_name})...")

        api = Api(self.api_key)
        table = api.table(base_id, table_name)

        records = table.all()
        data = []

        for record in records:
            row = {'id': record['id'], 'createdTime': record['createdTime']}
            row.update(record['fields'])
            data.append(row)

        print(f"Extracted {len(data)} records")
        self.data = data
        return data

    def _scrape_with_requests_api(self, base_id: Optional[str] = None,
                                   table_name: Optional[str] = None) -> List[Dict]:
        """Scrape using requests library with Airtable API"""
        if not REQUESTS_AVAILABLE:
            raise ImportError("requests library not installed")

        base_id = base_id or self.app_id
        table_name = table_name or self.table_id

        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }

        url = f'https://api.airtable.com/v0/{base_id}/{table_name}'
        data = []
        offset = None

        while True:
            params = {}
            if offset:
                params['offset'] = offset

            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()

            result = response.json()
            records = result.get('records', [])

            for record in records:
                row = {'id': record['id'], 'createdTime': record['createdTime']}
                row.update(record['fields'])
                data.append(row)

            offset = result.get('offset')
            if not offset:
                break

        print(f"Extracted {len(data)} records")
        self.data = data
        return data

    def remove_duplicates(self, key_fields: Optional[List[str]] = None) -> List[Dict]:
        """
        Remove duplicate rows based on key fields

        Args:
            key_fields: List of field names to use for deduplication.
                       If None, uses all fields except timestamps

        Returns:
            Deduplicated list of rows
        """
        if not self.data:
            return []

        print(f"Removing duplicates from {len(self.data)} rows...")

        seen = set()
        unique_data = []

        for row in self.data:
            # Create a key for deduplication
            if key_fields:
                key_values = tuple(row.get(field, '') for field in key_fields)
            else:
                # Use all fields except id and timestamps
                exclude_fields = {'id', 'createdTime', 'lastModifiedTime'}
                key_values = tuple(sorted(
                    (k, v) for k, v in row.items()
                    if k not in exclude_fields
                ))

            if key_values not in seen:
                seen.add(key_values)
                unique_data.append(row)

        removed = len(self.data) - len(unique_data)
        print(f"Removed {removed} duplicate rows, {len(unique_data)} unique rows remain")

        self.data = unique_data
        return unique_data

    def filter_recent(self, date_field: str = 'createdTime',
                      days: Optional[int] = None) -> List[Dict]:
        """
        Filter to keep only the most recent rows

        Args:
            date_field: Field name containing the date/timestamp
            days: If specified, only keep rows from the last N days

        Returns:
            Filtered list of rows
        """
        if not self.data:
            return []

        print(f"Filtering for recent rows (date_field: {date_field})...")

        # Parse dates
        rows_with_dates = []
        for row in self.data:
            if date_field in row:
                try:
                    # Try parsing ISO format
                    date_str = row[date_field]
                    if isinstance(date_str, str):
                        # Handle ISO format
                        if 'T' in date_str:
                            date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                        else:
                            # Try common date formats
                            for fmt in ['%Y-%m-%d', '%m/%d/%Y', '%d/%m/%Y']:
                                try:
                                    date_obj = datetime.strptime(date_str, fmt)
                                    break
                                except ValueError:
                                    continue
                            else:
                                continue

                        rows_with_dates.append((date_obj, row))
                except (ValueError, TypeError) as e:
                    print(f"Warning: Could not parse date '{row.get(date_field)}': {e}")
                    continue

        if not rows_with_dates:
            print("Warning: No rows with valid dates found")
            return self.data

        # Sort by date (most recent first)
        rows_with_dates.sort(key=lambda x: x[0], reverse=True)

        # Filter by days if specified
        if days is not None:
            cutoff_date = datetime.now() - timedelta(days=days)
            rows_with_dates = [(date, row) for date, row in rows_with_dates if date >= cutoff_date]
            print(f"Filtered to rows from last {days} days")

        self.data = [row for _, row in rows_with_dates]
        print(f"Kept {len(self.data)} recent rows")

        return self.data

    def save_to_json(self, filename: str = 'airtable_data.json'):
        """Save scraped data to JSON file"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, indent=2, ensure_ascii=False, default=str)
        print(f"Saved {len(self.data)} rows to {filename}")

    def save_to_csv(self, filename: str = 'airtable_data.csv'):
        """Save scraped data to CSV file"""
        if not self.data:
            print("No data to save")
            return

        import csv

        # Get all unique field names
        fieldnames = set()
        for row in self.data:
            fieldnames.update(row.keys())
        fieldnames = sorted(fieldnames)

        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(self.data)

        print(f"Saved {len(self.data)} rows to {filename}")


def main():
    parser = argparse.ArgumentParser(description='Scrape Airtable table with deduplication')
    parser.add_argument('url', nargs='?',
                       default='https://airtable.com/appk7qdCSlKGMnWbM/shrCf8aQnC4ke06ks/tblwo1OgfwmbaAyBT',
                       help='Airtable URL')
    parser.add_argument('--method', choices=['selenium', 'api'], default='selenium',
                       help='Scraping method to use')
    parser.add_argument('--api-key', help='Airtable API key (or set AIRTABLE_API_KEY env var)')
    parser.add_argument('--headless', action='store_true', default=True,
                       help='Run browser in headless mode')
    parser.add_argument('--output', default='airtable_data.json',
                       help='Output filename (JSON or CSV)')
    parser.add_argument('--dedupe-fields', nargs='+',
                       help='Fields to use for deduplication')
    parser.add_argument('--date-field', default='createdTime',
                       help='Field name for date filtering')
    parser.add_argument('--recent-days', type=int,
                       help='Only keep rows from last N days')

    args = parser.parse_args()

    # Create scraper
    scraper = AirtableScraper(args.url, api_key=args.api_key)

    # Scrape data
    try:
        if args.method == 'selenium':
            scraper.scrape_with_selenium(headless=args.headless)
        elif args.method == 'api':
            scraper.scrape_with_api()
    except Exception as e:
        print(f"Error during scraping: {e}")
        return 1

    # Process data
    if scraper.data:
        # Remove duplicates
        scraper.remove_duplicates(key_fields=args.dedupe_fields)

        # Filter recent rows
        if args.recent_days or args.date_field in (scraper.data[0] if scraper.data else {}):
            scraper.filter_recent(date_field=args.date_field, days=args.recent_days)

        # Save data
        if args.output.endswith('.csv'):
            scraper.save_to_csv(args.output)
        else:
            scraper.save_to_json(args.output)

        print(f"\n✓ Successfully scraped {len(scraper.data)} rows")
        return 0
    else:
        print("\n✗ No data was scraped")
        return 1


if __name__ == '__main__':
    exit(main())
