import OpenAI from 'openai';
import fs from 'fs';
import { logger } from '../utils/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function transcribeVideo(filePath: string): Promise<string> {
  try {
    logger.info(`Transcribing video: ${filePath}`);

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word'],
    });

    return transcription.text;
  } catch (error) {
    logger.error('Transcription failed:', error);
    throw new Error('Failed to transcribe video');
  }
}
