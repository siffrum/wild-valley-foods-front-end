// src/app/auth/auth.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { RouterModule } from '@angular/router';
import { ComponentRoutingModule } from './auth-routing.module';
import { TopNavComponent } from './internal/top-nav/top-nav.component';
import { SideNavComponent } from './internal/side-nav/side-nav.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ComponentRoutingModule,
    RouterModule,
    TopNavComponent,
    SideNavComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ComponentRoutingModule,
    RouterModule,
    TopNavComponent,
    SideNavComponent
  ]
})
export class ComponentModule {}
