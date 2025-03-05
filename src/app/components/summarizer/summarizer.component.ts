import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { ApiService } from '../../service/api.service';
import { FileUploadService } from '../../../api/FileUploadService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-summarizer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './summarizer.component.html',
  styleUrls: ['./summarizer.component.css'],
})
export class SummarizerComponent {
  showToast = false;
  userInput: string = '';
  summaryResult: string = '';
  isLoading: boolean = false;
  selectedContent: string = 'text'; // Default selection
  webpageUrl: string = '';
  pdfFile: File | null = null;
  selectedFileName: any;
  summaryWebpageResult:string[] = [];
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private apiService: ApiService,
    private fileUploadService: FileUploadService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  showContent(content: string) {
    this.selectedContent = content;
    this.summaryResult = '';
  }

  summarizeText() {
    if (!this.userInput.trim()) {
      this.summaryResult = 'Please enter text to summarize.';
      return;
    }
    this.isLoading = true;
    this.apiService.summarizeText(this.userInput, 'TEXT').subscribe({
      next: (response: any) => {
        // this.summaryResult = response;
        this.summaryResult = response.split(/\n/).filter((line: string) => line.trim() !== '').join('\n');
        this.isLoading = false;
      },
      error: (err) => {
        this.summaryResult = 'Error fetching summary.';
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  summarizeWebpage() {
    if (!this.webpageUrl.trim()) {
      this.summaryWebpageResult = ['Please enter a URL to summarize.'];
      return;
    }
    this.isLoading = true;
    this.apiService.summarizeText(this.webpageUrl, 'URL').subscribe({
      next: (response) => {
        // this.summaryResult = response;
        this.summaryWebpageResult = response.split(/\n/).filter((line: string) => line.trim() !== '');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.summaryWebpageResult = ['Error fetching summary.'];
        console.error(err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  summarizePdf() {
    if (!this.pdfFile) {
      this.summaryResult = 'Please upload a PDF file first.';
      return;
    }
    this.isLoading = true;
    const formData = new FormData();
    formData.append('file', this.pdfFile);

    this.http
      .post<{ summary: string }>('http://localhost:4200/upload', formData)
      .subscribe({
        next: (response) => {
          this.summaryResult = response.summary || 'No summary available.';
          this.isLoading = false;
        },
        error: (err) => {
          this.summaryResult = 'Error summarizing PDF.';
          console.error(err);
          this.isLoading = false;
        },
      });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (file.type !== 'application/pdf') {
        alert('Please select a valid PDF file.');
        return;
      }

      this.selectedFileName = file.name;
      this.pdfFile = file;
    }
  }

  openFileBrowser() {
    this.fileInput.nativeElement.click();
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.summaryResult).then(() => {
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 3000);
    });
  }

  refreshSummary() {
    if (this.selectedContent === 'text') {
      this.summarizeText();
    } else if (this.selectedContent === 'url') {
      this.summarizeWebpage();
    } else {
      this.summarizePdf();
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.selectedFileName = file;
      this.uploadFile(file);
      // if (file.type === 'application/pdf') {
      //   this.pdfFile = file;
      //   console.log("Dropped file:", file.name);
      // }
    }
  }

  async uploadFile(source: File) {
    if (!this.selectedFileName) {
      alert('Please select a file');
      return;
    }
    const formData = new FormData();
    formData.append('file', this.selectedFileName);
    this.http.post('http://localhost:4200/upload', formData).subscribe(
      (response) => console.log('Upload success', response),
      (error) => console.error('Upload error', error)
    );
  }
}
