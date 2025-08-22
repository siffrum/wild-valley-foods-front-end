import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  Injector,
  PLATFORM_ID,
  signal,
} from '@angular/core';
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
  isBrowser: boolean;
  indexDBStorageService: IndexDBStorageService | undefined;

  constructor(
    private injector: Injector,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      // lazy-resolve only when running in the browser
      this.indexDBStorageService = this.injector.get(IndexDBStorageService);
    }
  }
}
