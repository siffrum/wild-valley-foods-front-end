import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
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

  ngOnInit() {
    this.indexDBStorageService.saveToStorage('test', 'test');
  }
}
