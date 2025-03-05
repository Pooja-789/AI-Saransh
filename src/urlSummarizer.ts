import express, { Request, Response } from 'express';
import axios from 'axios';
import { load } from 'cheerio';
import https from 'https'; 
import { OllamaService } from './api/OllamaService';
import dotenv from 'dotenv';
import { environment } from '../environments/environment.local';

dotenv.config();
const router = express.Router();
const ollamaService = new OllamaService();
const rejectUnauthorized: boolean = !!environment.NODE_TLS_REJECT_UNAUTHORIZED;

console.log('Reject unauthorized:', rejectUnauthorized);
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized
  }),
});

router.get('/', async (req: Request, res: Response) => {
  // console.log('Request URL:', req.query['url']);

  const requestUrl = req.query['url'];
  if (!requestUrl || typeof requestUrl !== 'string') {
    return res.status(400).json({ message: 'No valid URL provided' });
  }

  try {
    const response = await axiosInstance.get(requestUrl, { responseType: 'text' });
    const contentType = response.headers['content-type'] || '';
    if (!contentType.includes('text/html')) {
      return res
        .status(400)
        .json({ message: 'URL does not contain HTML content' });
    }

    const $ = load(response.data);
    let textContent = $('body').text().replace(/\s+/g, ' ').trim();

    if (textContent.length > 5000) {
      textContent = textContent.substring(0, 5000);
    }

    const summary = await ollamaService.summarizer(textContent, 'URL');
    // console.log('Calling summarizer with URL:', ({ summary }));
    return res.json({ summary });
  } catch (err: any) {
    console.error('Error:', err.message);
    return res
      .status(500)
      .json({ message: 'Failed to process URL', error: err.message });
  }
});

export default router;
