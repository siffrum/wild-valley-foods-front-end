import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-product-form',
  imports: [CommonModule,FormsModule],
  templateUrl: './admin-product-form.html',
  styleUrl: './admin-product-form.scss'
})
export class AdminProductForm {
}
