import { Routes } from '@angular/router';
import { Home } from './main/components/main/end-user/home/home';

export const routes: Routes = [
  {path:'',redirectTo:'home',pathMatch:'full'},
  {path:'home',component:Home},
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
