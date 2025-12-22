/**
 * Airtable Scraper for n8n Code Node
 * Runs natively in n8n - no external servers needed!
 *
 * PASTE THIS ENTIRE CODE INTO N8N'S CODE NODE (JavaScript)
 */

// Configuration
const AIRTABLE_URL = 'https://airtable.com/appk7qdCSlKGMnWbM/shrCf8aQnC4ke06ks/tblwo1OgfwmbaAyBT';
const RECENT_DAYS = 30; // Only get rows from last N days (set to null for all)
const DEDUPE_FIELDS = []; // Fields to use for deduplication (empty = use all fields)

// Extract base, view, and table IDs from URL
function parseAirtableUrl(url) {
  const parts = url.split('/');
  return {
    appId: parts.find(p => p.startsWith('app')),
    viewId: parts.find(p => p.startsWith('shr')),
    tableId: parts.find(p => p.startswith('tbl'))
  };
}

// Fetch Airtable shared view data
async function scrapeAirtableSharedView(url) {
  try {
    // Method 1: Try to fetch the shared view HTML
    const response = await $http.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Extract data from HTML (Airtable embeds data in the page)
    const html = response.data;

    // Look for embedded JSON data
    const jsonMatch = html.match(/window\.init\s*=\s*({.*?});/s) ||
                      html.match(/initialData\s*=\s*({.*?});/s) ||
                      html.match(/data-application-state="([^"]*?)"/);

    if (jsonMatch) {
      let data;
      if (jsonMatch[1].startsWith('{')) {
        data = JSON.parse(jsonMatch[1]);
      } else {
        // Decode HTML entities
        const decoded = jsonMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
        data = JSON.parse(decoded);
      }

      // Extract records from the nested data structure
      const records = extractRecords(data);
      return records;
    }

    throw new Error('Could not find data in Airtable page');

  } catch (error) {
    throw new Error(`Failed to scrape Airtable: ${error.message}`);
  }
}

// Extract records from Airtable's data structure
function extractRecords(data) {
  const records = [];

  // Airtable's data can be nested in various ways
  // Try common paths
  const possiblePaths = [
    data.sharedViewData?.rows,
    data.table?.rows,
    data.rows,
    data.records,
    data.data?.rows,
    data.data?.records
  ];

  for (const path of possiblePaths) {
    if (path && Array.isArray(path)) {
      // Convert Airtable format to simple objects
      return path.map(row => {
        if (row.cellValuesByFieldId) {
          // Convert field IDs to field names if available
          const record = {};
          const fields = data.fields || data.table?.fields || [];

          for (const [fieldId, value] of Object.entries(row.cellValuesByFieldId)) {
            const field = fields.find(f => f.id === fieldId);
            const fieldName = field ? field.name : fieldId;
            record[fieldName] = value;
          }

          if (row.id) record.id = row.id;
          if (row.createdTime) record.createdTime = row.createdTime;

          return record;
        }
        return row;
      });
    }
  }

  return [];
}

// Remove duplicates
function removeDuplicates(data, keyFields = []) {
  const seen = new Set();
  const unique = [];

  for (const row of data) {
    let key;
    if (keyFields.length > 0) {
      key = keyFields.map(field => row[field] || '').join('|');
    } else {
      // Use all fields except id and timestamps
      const exclude = ['id', 'createdTime', 'lastModifiedTime'];
      const values = Object.entries(row)
        .filter(([k]) => !exclude.includes(k))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}:${v}`)
        .join('|');
      key = values;
    }

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(row);
    }
  }

  return unique;
}

// Filter recent records
function filterRecent(data, dateField = 'createdTime', days = null) {
  if (!days) return data;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return data.filter(row => {
    if (!row[dateField]) return true;

    try {
      const recordDate = new Date(row[dateField]);
      return recordDate >= cutoffDate;
    } catch (e) {
      return true;
    }
  }).sort((a, b) => {
    const dateA = new Date(a[dateField] || 0);
    const dateB = new Date(b[dateField] || 0);
    return dateB - dateA; // Most recent first
  });
}

// Main execution
try {
  console.log('🔍 Scraping Airtable...');

  // Scrape the data
  let data = await scrapeAirtableSharedView(AIRTABLE_URL);
  console.log(`✓ Found ${data.length} rows`);

  // Remove duplicates
  data = removeDuplicates(data, DEDUPE_FIELDS);
  console.log(`✓ After deduplication: ${data.length} rows`);

  // Filter recent
  if (RECENT_DAYS) {
    data = filterRecent(data, 'createdTime', RECENT_DAYS);
    console.log(`✓ After filtering (last ${RECENT_DAYS} days): ${data.length} rows`);
  }

  // Return each row as a separate n8n item
  return data.map(row => ({ json: row }));

} catch (error) {
  console.error('❌ Error:', error.message);
  throw error;
}
