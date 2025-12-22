#!/usr/bin/env python3
"""
n8n-friendly Airtable Scraper - No API Required!
Uses Selenium to scrape public Airtable shared views
Outputs JSON to stdout for easy consumption by n8n workflows
"""

import json
import sys
import os
import time
from datetime import datetime, timedelta
from typing import List, Dict, Optional

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


def scrape_airtable_selenium(url: str, headless: bool = True, wait_time: int = 10) -> List[Dict]:
    """
    Scrape Airtable using Selenium (no API required!)

    Args:
        url: Airtable shared view URL
        headless: Run browser without GUI
        wait_time: Seconds to wait for page load

    Returns:
        List of dictionaries containing row data
    """
    if not SELENIUM_AVAILABLE:
        raise ImportError("Selenium not installed. Run: pip install selenium")

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
        driver.get(url)
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
                element_found = True
                break
            except TimeoutException:
                continue

        # Give extra time for dynamic content
        time.sleep(3)

        # Extract table data
        rows = driver.find_elements(By.CSS_SELECTOR, "div[role='row']")
        if rows:
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

        # Fallback: Try to find any table elements
        if not data:
            tables = driver.find_elements(By.TAG_NAME, "table")
            for table in tables:
                headers = [th.text.strip() for th in table.find_elements(By.TAG_NAME, "th")]
                rows = table.find_elements(By.TAG_NAME, "tr")

                for row in rows[1:]:
                    cells = row.find_elements(By.TAG_NAME, "td")
                    row_data = {}
                    for idx, cell in enumerate(cells):
                        header = headers[idx] if idx < len(headers) else f"Column_{idx}"
                        row_data[header] = cell.text.strip()
                    if row_data:
                        data.append(row_data)

    finally:
        driver.quit()

    return data


def remove_duplicates(data: List[Dict], key_fields: Optional[List[str]] = None) -> List[Dict]:
    """
    Remove duplicate rows based on key fields

    Args:
        data: List of row dictionaries
        key_fields: Fields to use for deduplication (None = all fields except timestamps)

    Returns:
        Deduplicated list
    """
    if not data:
        return []

    seen = set()
    unique_data = []

    for row in data:
        # Create deduplication key
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

    return unique_data


def filter_recent(data: List[Dict], date_field: str = 'createdTime', days: Optional[int] = None) -> List[Dict]:
    """
    Filter to keep only recent rows

    Args:
        data: List of row dictionaries
        date_field: Field containing the date
        days: Only keep rows from last N days (None = all rows, sorted by date)

    Returns:
        Filtered and sorted list
    """
    if not data:
        return []

    rows_with_dates = []
    for row in data:
        if date_field in row:
            try:
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
            except (ValueError, TypeError):
                continue

    if not rows_with_dates:
        return data

    # Sort by date (most recent first)
    rows_with_dates.sort(key=lambda x: x[0], reverse=True)

    # Filter by days if specified
    if days is not None:
        cutoff_date = datetime.now() - timedelta(days=days)
        rows_with_dates = [(date, row) for date, row in rows_with_dates if date >= cutoff_date]

    return [row for _, row in rows_with_dates]


def scrape_for_n8n(
    url: str,
    dedupe_fields: Optional[List[str]] = None,
    date_field: str = 'createdTime',
    recent_days: Optional[int] = None,
    headless: bool = True
) -> Dict:
    """
    Scrape Airtable and return results in n8n-friendly format
    No API required - uses Selenium to scrape public shared views

    Returns:
        Dict with 'success', 'data', 'count', and optional 'error' fields
    """
    try:
        # Scrape with Selenium (no API needed!)
        data = scrape_airtable_selenium(url, headless=headless)

        # Process data if we got any
        if data:
            # Remove duplicates
            data = remove_duplicates(data, key_fields=dedupe_fields)

            # Filter recent if specified
            if recent_days or date_field in (data[0] if data else {}):
                data = filter_recent(data, date_field=date_field, days=recent_days)

        return {
            'success': True,
            'data': data,
            'count': len(data),
            'scraped_at': datetime.now().isoformat(),
            'method': 'selenium'
        }

    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'error_type': type(e).__name__,
            'data': [],
            'count': 0
        }


def main():
    """Main entry point for n8n - No API required!"""
    # Get configuration from environment variables or command line
    url = os.getenv('AIRTABLE_URL', 'https://airtable.com/appk7qdCSlKGMnWbM/shrCf8aQnC4ke06ks/tblwo1OgfwmbaAyBT')
    headless = os.getenv('HEADLESS', 'true').lower() == 'true'
    recent_days = os.getenv('RECENT_DAYS')
    date_field = os.getenv('DATE_FIELD', 'createdTime')
    dedupe_fields = os.getenv('DEDUPE_FIELDS', '').split(',') if os.getenv('DEDUPE_FIELDS') else None

    # Parse command line args if provided
    if len(sys.argv) > 1:
        url = sys.argv[1]

    # Convert recent_days to int if specified
    if recent_days:
        try:
            recent_days = int(recent_days)
        except ValueError:
            recent_days = None

    # Run scraper (Selenium only - no API needed!)
    result = scrape_for_n8n(
        url=url,
        dedupe_fields=dedupe_fields,
        date_field=date_field,
        recent_days=recent_days,
        headless=headless
    )

    # Output JSON to stdout for n8n to consume
    print(json.dumps(result, indent=2, default=str))

    # Exit with appropriate code
    sys.exit(0 if result['success'] else 1)


if __name__ == '__main__':
    main()
