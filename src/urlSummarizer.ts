import express, { Request, Response } from 'express';
import * as https from 'https';
import { environment } from '../environments/environment.local';
import { OllamaService } from './api/OllamaService';
import axios from 'axios';
import { load } from 'cheerio';

const router = express.Router();
const ollamaService = new OllamaService();

router.get('/', async (req: Request, res: Response) => {
  console.log('Request URL:', req.query['url']);

  const requestUrl = req.query['url'];
  let body = '';
  if (!requestUrl || typeof requestUrl !== 'string') {
    return res.status(400).json({ message: 'No valid URL provided' });
  }

  try {
    const parsedUrl = new URL(requestUrl);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      port: 443,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      agent: new https.Agent({
        rejectUnauthorized: environment.NODE_TLS_REJECT_UNAUTHORIZED ?? false,
      }),
    };

    console.log('options', options);
    const request = https.request(options, (response) => {
      response.on('data', (chunk) => {
        body += chunk;
      });

      response.on('end', async () => {
        try {
          const response = await axios.get(requestUrl, {
            responseType: 'text',
          });
          const body = response.data;

          const $ = load(body);
          const textContent = $('body').text();
          const cleanText = textContent.replace(/\s+/g, ' ').trim();

          const summary = await ollamaService.summarizer(cleanText, 'TEXT');
          return res.json({ summary });
        } catch (err) {
          console.error('Error summarizing content:', err);
          return res.status(500).json({ message: 'Error summarizing content' });
        }
      });
    });

    request.on('error', (err) => {
      console.error('Error fetching URL:', err.message);
      return res
        .status(500)
        .json({ message: 'Error fetching the URL', error: err.message });
    });
    request.end();
    return;
  } catch (err: any) {
    console.error('Unexpected error:', err.message);
    return res
      .status(500)
      .json({ message: 'Unexpected server error', error: err.message });
  }
});

export default router;
