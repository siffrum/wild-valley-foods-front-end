import { Routes } from '@angular/router';

export const routes: Routes = [
    {
    path: 'auth',
    loadChildren: () => import('../app/main/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '',loadChildren:()=> import('../app/main/components/auth.module').then(m => m.ComponentModule)
  },
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth' }
];
