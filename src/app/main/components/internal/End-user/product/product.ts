import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProductSM } from '../../../../../models/service-models/app/v1/product-s-m';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product',
  imports: [CommonModule],
  templateUrl: './product.html',
  styleUrl: './product.scss',
})
export class ProductCardComponent {
  @Input({ required: true }) product!: ProductSM;

  @Input() currency = '₹';
  @Input() weightUnit = 'kg';
  @Input() placeholder = 'assets/logo.png';
  @Input() showActions = true;

  @Output() addToCart = new EventEmitter<ProductSM>();
  @Output() view = new EventEmitter<ProductSM>();
  @Output() wishlist = new EventEmitter<ProductSM>();

  get isOutOfStock(): boolean {
    return (this.product?.stock ?? 0) <= 0;
  }

  onAddToCart() {
    if (!this.isOutOfStock) {
      this.addToCart.emit(this.product);
    }
  }

  onView() {
    this.view.emit(this.product);
  }

  onToggleWishlist() {
    this.wishlist.emit(this.product);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = this.placeholder;
  }
}
