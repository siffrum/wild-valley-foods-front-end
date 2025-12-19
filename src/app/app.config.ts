import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  NgxUiLoaderModule,
  NgxUiLoaderConfig,
  POSITION,
  PB_DIRECTION,
  SPINNER,
} from 'ngx-ui-loader';
import { routes } from './app.routes';
// Client hydration removed - not using SSR
// import {
//   provideClientHydration,
//   withEventReplay,
// } from '@angular/platform-browser';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  // Background spinner (non-blocking small spinner)
  bgsColor: '#ff4081',
  bgsOpacity: 0.3,
  bgsPosition: POSITION.bottomRight,
  bgsSize: 30,
  bgsType: SPINNER.rectangleBounce,

  // Foreground loader (blocks UI with spinner + progress bar)
  fgsColor: '#ffea00ff',
  fgsPosition: POSITION.centerCenter,
  fgsSize: 80,
  fgsType: SPINNER.threeStrings,

  // Display a logo above the spinner
  logoUrl: 'assets/logo-no-bg.png',
  logoSize: 100,
  logoPosition: POSITION.centerCenter,

  // Progress bar
  pbColor: '#ffd740',
  pbDirection: PB_DIRECTION.leftToRight,
  pbThickness: 6,
  hasProgressBar: true,

  // Loading message
  text: 'Loading, please wait...',
  textColor: '#ffffff',
  textPosition: POSITION.centerCenter,

  // Aesthetic effects
  overlayColor: 'rgba(0, 0, 0, 0.7)',
  overlayBorderRadius: '8px',
  blur: 4,
  fastFadeOut: true,
  delay: 100,
  minTime: 500,
  maxTime: 10000,
  gap: 16,
};
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // provideClientHydration(withEventReplay()), // Removed - not using SSR
    provideCharts(withDefaultRegisterables()),
    importProvidersFrom(NgxUiLoaderModule.forRoot(ngxUiLoaderConfig)),
  ],
};
