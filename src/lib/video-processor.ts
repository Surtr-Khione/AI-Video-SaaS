import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

export interface VideoProcessingOptions {
  outputPath: string;
  resolution?: string;
  format?: string;
  quality?: 'low' | 'medium' | 'high';
  duration?: number;
}

export interface VideoMetadata {
  duration: number;
  fileSize: number;
  resolution: string;
  format: string;
}

export class VideoProcessor {
  private outputDir: string;

  constructor() {
    this.outputDir = process.env.OUTPUT_DIR || './output';
    this.ensureOutputDir();
  }

  private async ensureOutputDir() {
    if (!existsSync(this.outputDir)) {
      await fs.mkdir(this.outputDir, { recursive: true });
    }
  }

  async createVideo(
    data: Record<string, any>,
    templateConfig: Record<string, any>,
    options: VideoProcessingOptions
  ): Promise<VideoMetadata> {
    const { outputPath, resolution = '1920x1080', format = 'mp4', quality = 'high' } = options;

    // Ensure output directory exists
    const outputDirPath = path.dirname(outputPath);
    if (!existsSync(outputDirPath)) {
      await fs.mkdir(outputDirPath, { recursive: true });
    }

    // Example: Create a simple test video with text overlay
    // In production, this would use the template config and data to create complex videos
    return new Promise((resolve, reject) => {
      const [width, height] = resolution.split('x').map(Number);
      const duration = templateConfig.duration || 10;

      // Create a simple colored video with text
      // This is a placeholder - in production you'd use templates, images, text overlays, etc.
      const color = data.backgroundColor || '#000000';
      const text = data.text || 'AI Generated Video';

      ffmpeg()
        .input(`color=${color}:s=${resolution}:d=${duration}`)
        .inputFormat('lavfi')
        .videoCodec('libx264')
        .outputOptions([
          '-pix_fmt yuv420p',
          `-preset ${quality === 'high' ? 'slow' : quality === 'medium' ? 'medium' : 'fast'}`,
          `-crf ${quality === 'high' ? '18' : quality === 'medium' ? '23' : '28'}`,
        ])
        .complexFilter([
          {
            filter: 'drawtext',
            options: {
              text: text.replace(/'/g, "\\'"),
              fontsize: 48,
              fontcolor: 'white',
              x: '(w-text_w)/2',
              y: '(h-text_h)/2',
            },
          },
        ])
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log('FFmpeg process started:', commandLine);
        })
        .on('progress', (progress) => {
          console.log(`Processing: ${progress.percent?.toFixed(2)}% done`);
        })
        .on('end', async () => {
          try {
            const stats = await fs.stat(outputPath);
            resolve({
              duration,
              fileSize: stats.size,
              resolution,
              format,
            });
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (err) => {
          reject(new Error(`Video processing failed: ${err.message}`));
        })
        .run();
    });
  }

  async processWithProgress(
    data: Record<string, any>,
    templateConfig: Record<string, any>,
    options: VideoProcessingOptions,
    onProgress?: (progress: number) => void
  ): Promise<VideoMetadata> {
    const { outputPath, resolution = '1920x1080', format = 'mp4', quality = 'high' } = options;

    const outputDirPath = path.dirname(outputPath);
    if (!existsSync(outputDirPath)) {
      await fs.mkdir(outputDirPath, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      const [width, height] = resolution.split('x').map(Number);
      const duration = templateConfig.duration || 10;

      const color = data.backgroundColor || '#000000';
      const text = data.text || 'AI Generated Video';

      ffmpeg()
        .input(`color=${color}:s=${resolution}:d=${duration}`)
        .inputFormat('lavfi')
        .videoCodec('libx264')
        .outputOptions([
          '-pix_fmt yuv420p',
          `-preset ${quality === 'high' ? 'slow' : quality === 'medium' ? 'medium' : 'fast'}`,
          `-crf ${quality === 'high' ? '18' : quality === 'medium' ? '23' : '28'}`,
        ])
        .complexFilter([
          {
            filter: 'drawtext',
            options: {
              text: text.replace(/'/g, "\\'"),
              fontsize: 48,
              fontcolor: 'white',
              x: '(w-text_w)/2',
              y: '(h-text_h)/2',
            },
          },
        ])
        .output(outputPath)
        .on('progress', (progress) => {
          if (onProgress && progress.percent) {
            onProgress(progress.percent);
          }
        })
        .on('end', async () => {
          try {
            const stats = await fs.stat(outputPath);
            resolve({
              duration,
              fileSize: stats.size,
              resolution,
              format,
            });
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (err) => {
          reject(new Error(`Video processing failed: ${err.message}`));
        })
        .run();
    });
  }

  async getVideoInfo(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata);
        }
      });
    });
  }
}

export const videoProcessor = new VideoProcessor();
