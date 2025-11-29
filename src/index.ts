/**
 * Main entry point for AI Video SaaS application
 */

import { config } from './config';
import { VideoProcessor } from './services/videoProcessor';

async function main() {
  console.log('Starting AI Video SaaS application...');

  const processor = new VideoProcessor(config);
  await processor.initialize();

  console.log('Application started successfully');
}

main().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
