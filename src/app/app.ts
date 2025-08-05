import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopNavComponent } from './main/components/internal/top-nav/top-nav.component';
import { Footer } from './main/components/internal/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,TopNavComponent,Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('wild-valley-food');
}
