import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SummarizerComponent } from './components/summarizer/summarizer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SummarizerComponent ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'AI-Saransh';
}
