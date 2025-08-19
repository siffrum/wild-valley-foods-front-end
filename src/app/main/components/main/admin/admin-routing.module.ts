// src/app/auth/auth-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComponentLayoutComponent } from './components-layout/component-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WebsiteResourcesComponent } from './website-resources/website-resources.component';
import { CategoryList } from './category-list/category-list';
import { ProductList } from './product-list/product-list';
const routes: Routes = [
  {
    path: '',
    component: ComponentLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'website-resources', component: WebsiteResourcesComponent },
      {path:'category-list',component:CategoryList},
      {path:'product-list',component:ProductList}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
