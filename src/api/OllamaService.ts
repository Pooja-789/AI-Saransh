import { environment } from "../../environments/environment.local";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root",
  })
  
export class OllamaService {

  public async summarizer(question: string): Promise<string | null> {
    try {

      console.log(`Sending request to ${environment.ollamaApiGenerateUrl} with question: ${question}`);

      const response = await fetch(environment.ollamaApiGenerateUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "phi3",
          prompt: `Please provide the summary of the text: ${question}`,
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
        console.error("Error in OllamaService.summarizer: Request timed out");
      } else if (error instanceof TypeError) {
        console.error("Error in OllamaService.summarizer: Failed to fetch. Possible network issues or incorrect API endpoint.");
        console.error(`Failed URL: ${environment.ollamaApiGenerateUrl}`);
      } else {
        console.error("Error in OllamaService.summarizer:", error);
      }
      return null;
    }
  }
}

