import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { OllamaService } from '../../api/OllamaService';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient, private ollamaService: OllamaService) {}

  summarizeText(prompt: string, type: 'TEXT' | 'URL'): Observable<string> {
    return new Observable((observer) => {
      if (type === 'TEXT') {
        const formattedPrompt = `Summarize: ${prompt}`;
        this.ollamaService
          .summarizer(formattedPrompt)
          .then((response) => {
            observer.next(response || 'No response from Ollama.');
            observer.complete();
          })
          .catch((error) => observer.error(error));
      } else if (type === 'URL') {
        fetch(prompt, {
          method: "GET",
          mode: "no-cors",
          // headers: { "Content-Type": "text/html" },
        })
          .then((response) => {
            if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
            return response.text();
          })
          .then((htmlContent) => {
            const extractedText = this.extractTextFromHTML(htmlContent);
            if (!extractedText) {
              observer.error("Unable to extract text from URL.");
              return;
            }
      
            // Limit text length (avoid sending too much data to Ollama)
            const maxTextLength = 5000;
            const truncatedText =
              extractedText.length > maxTextLength
                ? extractedText.substring(0, maxTextLength) + "..."
                : extractedText;
      
            const formattedPrompt = `Summarize the following content in bullet points:\n\n${truncatedText}`;
      
            this.ollamaService
              .summarizer(formattedPrompt)
              .then((response) => {
                observer.next(response || "No response from Ollama.");
                observer.complete();
              })
              .catch((error) => observer.error(error));
          })
          .catch((error) => observer.error("Error fetching webpage: " + error));
      }
    });
  }
      
      private extractTextFromHTML(html: string): string {
        const doc = new DOMParser().parseFromString(html, "text/html");
      
        // Remove unnecessary content (scripts, styles, etc.)
        doc.querySelectorAll("script, style, noscript, iframe, header, footer, nav, aside").forEach((e) => e.remove());
      
        let extractedText = doc.body.innerText || "";
      
        // Clean up excessive whitespace
        extractedText = extractedText.replace(/\s+/g, " ").trim();
      
        return extractedText;
      }
      
}
