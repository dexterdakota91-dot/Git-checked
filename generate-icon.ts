import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateIcon() {
  try {
    console.log('Generating image...');
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: 'A sleek, modern, minimalist app icon for an AI business automation platform. The icon features a glowing ethereal Aetheris or a stylized abstract geometric shape. Dark background, vibrant blue and white accents. High quality, flat design, suitable for an iOS or Android app icon. No text.',
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1',
      },
    });

    const base64Image = response.generatedImages[0].image.imageBytes;
    const buffer = Buffer.from(base64Image, 'base64');
    
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }
    
    fs.writeFileSync(path.join(publicDir, 'icon.png'), buffer);
    console.log('Icon generated successfully at public/icon.png');
  } catch (error) {
    console.error('Error generating icon:', error);
  }
}

generateIcon();
