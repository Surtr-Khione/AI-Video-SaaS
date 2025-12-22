#!/usr/bin/env python3
"""
Flask API Server for Airtable Scraper - No Airtable API Required!
Uses Selenium to scrape public Airtable views
Provides REST API endpoints for n8n HTTP Request nodes
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime
from scrape_airtable_n8n import scrape_for_n8n

app = Flask(__name__)
CORS(app)  # Enable CORS for n8n requests

# Configuration
API_KEY = os.getenv('API_KEY', 'your-secret-api-key')  # For API authentication


def verify_api_key():
    """Verify API key from request header"""
    api_key = request.headers.get('X-API-Key')
    if not api_key or api_key != API_KEY:
        return False
    return True


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })


@app.route('/scrape', methods=['POST'])
def scrape():
    """
    Main scraping endpoint - No Airtable API required!

    Request body:
    {
        "url": "https://airtable.com/...",
        "dedupe_fields": ["field1", "field2"],
        "date_field": "createdTime",
        "recent_days": 30,
        "headless": true
    }
    """
    # Verify API key
    if not verify_api_key():
        return jsonify({'error': 'Unauthorized', 'success': False}), 401

    # Get request data
    data = request.get_json() or {}

    # Extract parameters
    url = data.get('url', os.getenv('AIRTABLE_URL'))
    if not url:
        return jsonify({
            'success': False,
            'error': 'URL is required'
        }), 400

    dedupe_fields = data.get('dedupe_fields')
    date_field = data.get('date_field', 'createdTime')
    recent_days = data.get('recent_days')
    headless = data.get('headless', True)

    # Run scraper (Selenium only - no Airtable API needed!)
    result = scrape_for_n8n(
        url=url,
        dedupe_fields=dedupe_fields,
        date_field=date_field,
        recent_days=recent_days,
        headless=headless
    )

    # Return result
    status_code = 200 if result['success'] else 500
    return jsonify(result), status_code


@app.route('/scrape', methods=['GET'])
def scrape_get():
    """
    GET endpoint for simple scraping with query parameters
    No Airtable API required!

    Query params:
    - url: Airtable URL (optional, uses env var if not provided)
    - recent_days: Number of days to filter
    """
    # Verify API key
    if not verify_api_key():
        return jsonify({'error': 'Unauthorized', 'success': False}), 401

    # Get query parameters
    url = request.args.get('url') or os.getenv('AIRTABLE_URL')
    if not url:
        return jsonify({
            'success': False,
            'error': 'URL is required'
        }), 400

    recent_days = request.args.get('recent_days')
    if recent_days:
        try:
            recent_days = int(recent_days)
        except ValueError:
            recent_days = None

    # Run scraper (Selenium only - no Airtable API needed!)
    result = scrape_for_n8n(
        url=url,
        recent_days=recent_days,
        headless=True
    )

    # Return result
    status_code = 200 if result['success'] else 500
    return jsonify(result), status_code


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'false').lower() == 'true'

    print(f"Starting Airtable Scraper API on port {port}")
    print(f"API Key: {API_KEY}")
    print(f"Debug mode: {debug}")

    app.run(host='0.0.0.0', port=port, debug=debug)
