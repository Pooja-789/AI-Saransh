import { environment } from '../../environments/environment.local';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  public async summarizePdf(pdfContent: string): Promise<string | null> {
    try {
      if (!pdfContent.trim()) {
        throw new Error("No PDF content provided for summarization.");
      }
      const prompt = `Please summarize the following PDF content and provide the key points in bullet points:\n\n${pdfContent}`;
      console.log(`Sending request to ${environment.ollamaApiGenerateUrl} with question: ${pdfContent}`);

      const response = await fetch(environment.ollamaApiGenerateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'phi3',
          prompt: prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || null;
    } catch (error) {
      console.error('Error in FileUploadService.summarizePdf:', error);
      return null;
    }
  }
}
