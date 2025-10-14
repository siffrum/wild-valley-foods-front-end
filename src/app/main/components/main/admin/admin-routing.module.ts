import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponentLayoutComponent } from './admin-components-layout/admin-component-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WebsiteResourcesComponent } from './website-resources/Banner/website-resources.component';
import { AdminCategoryList } from './admin-category-list/admin-category-list';
import { AdminProductList } from './admin-product-list/admin-product-list';
import { ContactUs } from './Contact-Us/contact-us/contact-us';
import { ReviewList } from './Review/review-list/review-list';
import path from 'path';
import { TestimonialList } from './website-resources/Testimonial/testimonial-list/testimonial-list';
import { VideoList } from './website-resources/video/video-list/video-list';
import { AuthGuard } from '../../../../guard/auth.guard';
const routes: Routes = [
  {
    path: '',
    component: AdminComponentLayoutComponent,
    canActivateChild: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'website-resources', component: WebsiteResourcesComponent },
      {path:'category-list',component:AdminCategoryList},
      {path:'product-list',component:AdminProductList},
      {path:'contact-us',component:ContactUs},
      {path:'review-list',component:ReviewList},
      {path:'testimonial-list',component:TestimonialList},
      {path:'videos',component:VideoList}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
