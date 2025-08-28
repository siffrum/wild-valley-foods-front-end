import { Routes } from '@angular/router';
import { AuthGuard } from './guard/auth.guard';

export const routes: Routes = [
  {path:'', redirectTo: 'home', pathMatch: 'full'},
    {
    path: '',
    loadChildren: () => import('../app/main/components/main/end-user/end-user-.module').then(m => m.EndUserModule)
  },
    {
    path: 'auth',
    loadChildren: () => import('../app/main/auth/auth.module').then(m => m.AuthModule)
  },

  {
    path: 'admin',loadChildren:()=> import('./main/components/main/admin/admin.module').then(m => m.AdminModule),canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '' }
];
