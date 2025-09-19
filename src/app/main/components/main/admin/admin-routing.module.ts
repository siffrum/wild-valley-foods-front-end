import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponentLayoutComponent } from './admin-components-layout/admin-component-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WebsiteResourcesComponent } from './website-resources/Banner/website-resources.component';
import { AdminCategoryList } from './admin-category-list/admin-category-list';
import { AdminProductList } from './admin-product-list/admin-product-list';
const routes: Routes = [
  {
    path: '',
    component: AdminComponentLayoutComponent,
    children: [
      // { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'website-resources', component: WebsiteResourcesComponent },
      {path:'category-list',component:AdminCategoryList},
      {path:'product-list',component:AdminProductList}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
