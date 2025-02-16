import { Component, ElementRef, ViewChild } from '@angular/core';
import { ApiService } from '../../service/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-summarizer',
  imports: [CommonModule, FormsModule],
  templateUrl: './summarizer.component.html',
  styleUrls: ['./summarizer.component.css']
})
export class SummarizerComponent {

  showToast = false;
  userInput: string = '';
  summaryResult: string = "";
  isLoading: boolean = false;
  selectedContent: string = 'text'; // Initially empty
  webpageUrl: string = '';
  pdfFile: File | null = null;
  // fileUrl: string = '';
  selectedFileName: string = '';
  fileUrl: string | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(private openaiService: ApiService) {}

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
    this.openaiService.summarizeText(this.userInput, 'TEXT').subscribe({
      next: (response) => {
        this.summaryResult = response;
        this.isLoading = false;
      },
      error: (err) => {
        this.summaryResult = 'Error fetching summary.';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  summarizeWebpage() {
    if (!this.webpageUrl.trim()) {
      this.summaryResult = 'Please enter a URL to summarize.';
      return;
    }

    this.isLoading = true;
    this.openaiService.summarizeText(this.webpageUrl, 'URL').subscribe({
      next: (response) => {
        this.summaryResult = response;
        this.isLoading = false;
      },
      error: (err) => {
        this.summaryResult = 'Error fetching summary.';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.summaryResult).then(() => {
      // alert('Summary copied to clipboard!');
      this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000); // Hide toast after 3 seconds
    });
  }

  refreshSummary() {
    if (this.selectedContent === 'text') {
      this.summarizeText();
    } else {
      this.summarizeWebpage();
    }
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
      this.fileUrl = URL.createObjectURL(file); // Create preview URL
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.processFile(file);
      // if (file.type === 'application/pdf') {
      //   this.pdfFile = file;
      //   console.log("Dropped file:", file.name);
      // }
    }
  }

  processFile(file: File) {
    if (file.type === "application/pdf") {
      this.selectedFileName = file.name;
      // You can add logic to upload and process the file
    } else {
      alert("Please select a valid PDF file.");
    }
  }
  
  openFileBrowser() {
    this.fileInput.nativeElement.click();
  }

}
