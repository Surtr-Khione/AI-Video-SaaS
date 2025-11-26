#!/usr/bin/env node

/**
 * Prompt Validator
 * Validates prompt JSON files against the schema
 *
 * Usage:
 *   node utils/prompt-validator.js <path-to-prompt.json>
 *   node utils/prompt-validator.js prompts/saas/crm-sales-acceleration.json
 */

const fs = require('fs');
const path = require('path');

// Simple validation without external dependencies
function validatePrompt(promptPath) {
  console.log(`\n🔍 Validating: ${promptPath}\n`);

  // Check if file exists
  if (!fs.existsSync(promptPath)) {
    console.error(`❌ Error: File not found: ${promptPath}`);
    process.exit(1);
  }

  // Read and parse JSON
  let prompt;
  try {
    const content = fs.readFileSync(promptPath, 'utf8');
    prompt = JSON.parse(content);
    console.log('✅ Valid JSON format');
  } catch (error) {
    console.error(`❌ JSON Parse Error: ${error.message}`);
    process.exit(1);
  }

  // Validate required fields
  const requiredFields = ['id', 'name', 'category', 'framework', 'prompt', 'metadata'];
  const missingFields = [];

  requiredFields.forEach(field => {
    if (!prompt[field]) {
      missingFields.push(field);
    }
  });

  if (missingFields.length > 0) {
    console.error(`❌ Missing required fields: ${missingFields.join(', ')}`);
    process.exit(1);
  }
  console.log('✅ All required fields present');

  // Validate framework
  const validFrameworks = [
    'problem-reaction-solution',
    'feature-benefit-tiedown',
    'save-the-cat',
    'hero-journey',
    'before-after-bridge',
    'aida'
  ];

  if (!validFrameworks.includes(prompt.framework)) {
    console.warn(`⚠️  Warning: Framework "${prompt.framework}" not in standard list`);
  } else {
    console.log(`✅ Valid framework: ${prompt.framework}`);
  }

  // Validate prompt structure
  if (!prompt.prompt.main) {
    console.error('❌ Missing prompt.main field');
    process.exit(1);
  }
  console.log('✅ Prompt structure valid');

  // Validate metadata
  const requiredMetadata = ['targetAudience', 'keyFeatures', 'duration'];
  const missingMetadata = [];

  requiredMetadata.forEach(field => {
    if (!prompt.metadata[field]) {
      missingMetadata.push(field);
    }
  });

  if (missingMetadata.length > 0) {
    console.error(`❌ Missing metadata fields: ${missingMetadata.join(', ')}`);
    process.exit(1);
  }
  console.log('✅ Metadata complete');

  // Validate key features
  if (Array.isArray(prompt.metadata.keyFeatures)) {
    const allHaveBenefits = prompt.metadata.keyFeatures.every(
      f => f.feature && f.benefit
    );
    if (!allHaveBenefits) {
      console.warn('⚠️  Warning: Some key features missing feature or benefit');
    } else {
      console.log(`✅ ${prompt.metadata.keyFeatures.length} key features validated`);
    }
  }

  // Summary
  console.log('\n📊 Validation Summary:');
  console.log(`   ID: ${prompt.id}`);
  console.log(`   Name: ${prompt.name}`);
  console.log(`   Category: ${prompt.category}`);
  console.log(`   Framework: ${prompt.framework}`);
  console.log(`   Duration: ${prompt.metadata.duration}`);
  console.log(`   Target Audiences: ${prompt.metadata.targetAudience.length}`);
  console.log(`   Key Features: ${prompt.metadata.keyFeatures.length}`);

  if (prompt.script && prompt.script.storyboard) {
    console.log(`   Storyboard Scenes: ${prompt.script.storyboard.length}`);
  }

  console.log('\n✅ Validation successful!\n');
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node utils/prompt-validator.js <path-to-prompt.json>');
    console.log('\nExamples:');
    console.log('  node utils/prompt-validator.js prompts/saas/crm-sales-acceleration.json');
    console.log('  node utils/prompt-validator.js prompts/mobile-apps/fitness-tracking-app.json');
    process.exit(1);
  }

  validatePrompt(args[0]);
}

module.exports = { validatePrompt };
