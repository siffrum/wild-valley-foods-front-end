import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'product/:id',
    renderMode: RenderMode.Server, // SSR for dynamic routes
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender, // all other routes prerendered
  },
];
