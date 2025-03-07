import { Injectable } from '@angular/core';
import { map, Observable, switchMap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { OllamaService } from '../../api/OllamaService';
import { FileUploadService } from '../../api/FileUploadService';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(
    private http: HttpClient,
    private ollamaService: OllamaService,
    private fileUploadService: FileUploadService
  ) {}

  summarizeText(prompt: string, type: 'TEXT' | 'URL' ): Observable<string> {
    if (type === 'TEXT') {
      return this.summarizeTextDirectly(prompt);
    } else if (type === 'URL') {
      return this.summarizeFromUrl(prompt);
    } else if (type === 'PDF') {
      // return this.summarizePdf(prompt);
    }
    return throwError(() => new Error('Invalid type provided'));
  }

  private summarizeTextDirectly(prompt: string): Observable<string> {
    return new Observable<string>((observer) => {
      const formattedPrompt = `Summarize: ${prompt}`;
      this.ollamaService
        .summarizer(formattedPrompt, 'TEXT')
        .then((response) => {
          observer.next(response || 'No response from Ollama.');
          observer.complete();
        })
        .catch((error) => observer.error(error));
    });
  }

  private summarizeFromUrl(url: string): Observable<string> {
    return this.http
      .get<{ summary: string }>(
        `http://localhost:4200/summarize-url?url=${encodeURIComponent(url)}`
      )
      .pipe(
        map((response) => response.summary),
        switchMap(
          (content) =>
            new Observable<string>((observer) => {
              this.ollamaService
                .summarizer(content, 'URL')
                .then((summary) => {
                  observer.next(summary || 'No response from Ollama.');
                  observer.complete();
                })
                .catch((error) => observer.error(error));
            })
        )
      );
  }

  // private summarizePdf(pdfContent: string): Observable<string> {
  //   return new Observable<string>((observer) => {
  //     this.fileUploadService
  //       .summarizePdf(pdfContent)
  //       .then((response: any) => {
  //         observer.next(response || 'No response from Ollama.');
  //         observer.complete();
  //       })
  //       .catch((error: any) => observer.error(error));
  //   });
  // }
}
