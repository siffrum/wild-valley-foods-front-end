import { CommonModule } from '@angular/common';
import { Component, HostListener, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IndexDBStorageService } from './services/indexdb.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('wild-valley-food');

  constructor(private indexDBStorageService: IndexDBStorageService) {}
  @HostListener('window:beforeunload', ['$event'])
  clearOnUnload(event: any) {
    this.indexDBStorageService.clearSessionStorage(); // Clear session storage when tab closes or reloads from indexdb
  }
}
