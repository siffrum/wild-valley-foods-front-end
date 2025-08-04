// src/app/auth/auth-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComponentLayoutComponent } from './main/admin/components-layout/component-layout.component';
import { DashboardComponent } from './main/admin/dashboard/dashboard.component';
import { WebsiteResourcesComponent } from './main/admin/website-resources/website-resources.component';
const routes: Routes = [
  {
    path: '',
    component: ComponentLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'website-resources', component: WebsiteResourcesComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComponentRoutingModule {}
