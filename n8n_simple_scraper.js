/**
 * SIMPLE Airtable Scraper for n8n Code Node
 * Works entirely in cloud-hosted n8n - no external dependencies!
 *
 * HOW TO USE:
 * 1. Create a new "Code" node in n8n
 * 2. Set language to "JavaScript"
 * 3. Paste this entire code
 * 4. Update the CONFIG section below
 * 5. Run!
 */

// ========== CONFIGURATION ==========
const CONFIG = {
  airtableUrl: 'https://airtable.com/appk7qdCSlKGMnWbM/shrCf8aQnC4ke06ks/tblwo1OgfwmbaAyBT',
  recentDays: 30,        // Only get rows from last N days (null = all rows)
  dateField: 'createdTime',
  dedupeFields: []       // Leave empty to dedupe on all fields
};
// ====================================

// Parse Airtable URL to get IDs
function parseUrl(url) {
  const match = url.match(/\/app([^\/]+)\/shr([^\/]+)(?:\/tbl([^\/]+))?/);
  if (!match) throw new Error('Invalid Airtable URL');

  return {
    appId: 'app' + match[1],
    shareId: 'shr' + match[2],
    tableId: match[3] ? 'tbl' + match[3] : null
  };
}

// Fetch Airtable shared view
async function fetchAirtableData(url) {
  const { appId, shareId, tableId } = parseUrl(url);

  // Try the Airtable shared view API endpoint
  const apiUrl = `https://airtable.com/${appId}/${shareId}${tableId ? '/' + tableId : ''}`;

  try {
    // First attempt: Fetch the page
    const response = await $http.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 30000
    });

    const html = response.data;

    // Extract embedded JSON data from the page
    // Airtable embeds data in various script tags
    const patterns = [
      /window\.init\s*=\s*({[\s\S]*?});/,
      /var\s+initialData\s*=\s*({[\s\S]*?});/,
      /data-application-state="([^"]+)"/,
      /__INITIAL_STATE__\s*=\s*({[\s\S]*?});/
    ];

    let data = null;
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        try {
          const jsonStr = match[1].startsWith('{')
            ? match[1]
            : match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#x27;/g, "'");

          data = JSON.parse(jsonStr);
          if (data) break;
        } catch (e) {
          continue;
        }
      }
    }

    if (!data) {
      throw new Error('Could not extract data from Airtable page. The view may be private or the format has changed.');
    }

    return extractRecordsFromData(data);

  } catch (error) {
    if (error.response?.status === 403 || error.response?.status === 401) {
      throw new Error('Access denied. Make sure the Airtable view is shared publicly.');
    }
    throw new Error(`Failed to fetch Airtable data: ${error.message}`);
  }
}

// Extract records from Airtable's nested data structure
function extractRecordsFromData(data) {
  const records = [];

  // Navigate through various possible data structures
  const possibleDataPaths = [
    () => data.sharedViewData?.rows,
    () => data.table?.rows,
    () => data.rows,
    () => data.records,
    () => data.data?.table?.rows,
    () => data.data?.rows,
    () => Object.values(data).find(v => Array.isArray(v?.rows))?.rows,
    () => Object.values(data).find(v => Array.isArray(v))
  ];

  let rawRecords = null;
  for (const pathFn of possibleDataPaths) {
    try {
      const result = pathFn();
      if (result && Array.isArray(result) && result.length > 0) {
        rawRecords = result;
        break;
      }
    } catch (e) {
      continue;
    }
  }

  if (!rawRecords) {
    // Last resort: search for any array in the data
    const findArrays = (obj, depth = 0) => {
      if (depth > 5) return null;
      if (Array.isArray(obj) && obj.length > 0 && typeof obj[0] === 'object') {
        return obj;
      }
      if (obj && typeof obj === 'object') {
        for (const value of Object.values(obj)) {
          const result = findArrays(value, depth + 1);
          if (result) return result;
        }
      }
      return null;
    };

    rawRecords = findArrays(data);
  }

  if (!rawRecords || !Array.isArray(rawRecords)) {
    throw new Error('Could not find records in the data structure');
  }

  // Get field names
  const fields = data.fields || data.table?.fields || data.sharedViewData?.fields || [];
  const fieldMap = {};
  fields.forEach(f => {
    if (f.id && f.name) fieldMap[f.id] = f.name;
  });

  // Convert to simple objects
  return rawRecords.map(row => {
    const record = {};

    // Handle different record formats
    if (row.cellValuesByFieldId) {
      // Format: { cellValuesByFieldId: { fldXXX: value } }
      for (const [fieldId, value] of Object.entries(row.cellValuesByFieldId)) {
        const fieldName = fieldMap[fieldId] || fieldId;
        record[fieldName] = formatValue(value);
      }
    } else if (row.fields) {
      // Format: { fields: { fieldName: value } }
      Object.assign(record, row.fields);
    } else {
      // Direct format
      Object.assign(record, row);
    }

    // Add metadata
    if (row.id) record.id = row.id;
    if (row.createdTime) record.createdTime = row.createdTime;

    return record;
  });
}

// Format field values
function formatValue(value) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) {
    // Handle arrays (like multi-select or attachments)
    if (value.length === 0) return '';
    if (typeof value[0] === 'object') {
      // Array of objects (attachments, linked records)
      return value.map(v => v.name || v.text || v.url || JSON.stringify(v)).join(', ');
    }
    return value.join(', ');
  }
  if (typeof value === 'object') {
    // Handle objects (like user, date with timezone, etc)
    return value.name || value.text || value.email || JSON.stringify(value);
  }
  return value;
}

// Remove duplicate rows
function removeDuplicates(data, keyFields = []) {
  const seen = new Set();
  const unique = [];

  for (const row of data) {
    let key;

    if (keyFields && keyFields.length > 0) {
      // Use specific fields for deduplication
      key = keyFields.map(field => String(row[field] || '')).join('|||');
    } else {
      // Use all fields except metadata
      const exclude = new Set(['id', 'createdTime', 'lastModifiedTime']);
      key = Object.keys(row)
        .filter(k => !exclude.has(k))
        .sort()
        .map(k => `${k}:${String(row[k])}`)
        .join('|||');
    }

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(row);
    }
  }

  return unique;
}

// Filter to recent rows only
function filterRecent(data, dateField, days) {
  if (!days) return data;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  cutoffDate.setHours(0, 0, 0, 0);

  const filtered = data.filter(row => {
    if (!row[dateField]) return true; // Keep rows without date

    try {
      const rowDate = new Date(row[dateField]);
      return rowDate >= cutoffDate;
    } catch (e) {
      return true; // Keep rows with invalid dates
    }
  });

  // Sort by date (most recent first)
  filtered.sort((a, b) => {
    try {
      const dateA = new Date(a[dateField] || 0);
      const dateB = new Date(b[dateField] || 0);
      return dateB - dateA;
    } catch (e) {
      return 0;
    }
  });

  return filtered;
}

// ========== MAIN EXECUTION ==========
(async () => {
  try {
    console.log('🔍 Scraping Airtable...');
    console.log('URL:', CONFIG.airtableUrl);

    // Fetch data
    let data = await fetchAirtableData(CONFIG.airtableUrl);
    console.log(`✓ Fetched ${data.length} rows`);

    // Remove duplicates
    const beforeDedupe = data.length;
    data = removeDuplicates(data, CONFIG.dedupeFields);
    console.log(`✓ After deduplication: ${data.length} rows (removed ${beforeDedupe - data.length})`);

    // Filter recent
    if (CONFIG.recentDays) {
      const beforeFilter = data.length;
      data = filterRecent(data, CONFIG.dateField, CONFIG.recentDays);
      console.log(`✓ After filtering (last ${CONFIG.recentDays} days): ${data.length} rows (removed ${beforeFilter - data.length})`);
    }

    // Log first row as sample
    if (data.length > 0) {
      console.log('📄 Sample row:', JSON.stringify(data[0], null, 2));
    }

    console.log(`\n✅ Success! Returning ${data.length} rows to n8n`);

    // Return data to n8n (each row becomes an item)
    return data.map(row => ({ json: row }));

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
})();
