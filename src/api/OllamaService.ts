import { environment } from '../../environments/environment.local';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OllamaService {
  public async summarizer( question: string, type: 'TEXT' | 'URL' | 'PDF'): Promise<string | null> {
    try {
      let prompt;
      if (!question.trim()) {
        throw new Error("No text provided for summarization.");
    }
      if (type === 'TEXT') {
        prompt = `Please summarize the following text and give the response in bullet points: ${question} `;
      } else if (type === 'URL') {
        prompt = `Here is the main content of a webpage. Extract the key points and summarize in bullet points:\n\n${question}`;
    } else {
        throw new Error('Invalid input type.');
      }

      console.log(`Sending request to ${environment.ollamaApiGenerateUrl} with question: ${question}`);

      console.log("prompt", prompt);
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
      return data.response || null; // Assuming API returns a 'response' field
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Error in OllamaService.summarizer: Request timed out');
      } else if (error instanceof TypeError) {
        console.error(
          'Error in OllamaService.summarizer: Failed to fetch. Possible network issues or incorrect API endpoint.'
        );
        console.error(`Failed URL: ${environment.ollamaApiGenerateUrl}`);
      } else {
        console.error('Error in OllamaService.summarizer:', error);
      }
      return null;
    }
  }

}
