// product-card.component.ts (fixed)
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ProductSM } from '../../../../../models/service-models/app/v1/product-s-m';
import { WishlistService } from '../../../../../services/wishlist.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product',
  templateUrl: './product.html',
  styleUrls: ['./product.scss'], // <-- fixed
  imports: [CommonModule],
})
export class ProductCardComponent implements OnInit, OnChanges {
  @Input({ required: true }) product!: ProductSM;

  @Input() currency = '₹';
  @Input() weightUnit = 'kg';
  @Input() placeholder = 'assets/logo.png';
  @Input() showActions = true;

  @Output() addToCart = new EventEmitter<ProductSM>();
  @Output() view = new EventEmitter<ProductSM>();
  @Output() wishlist = new EventEmitter<ProductSM>();

  constructor(
    private wishlistService: WishlistService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    await this.setWishlistedFlag();
  }
  async setWishlistedFlag() {
    this.product.isWishlisted = await this.wishlistService.isWishlisted(
      this.product
    );
  }
  // also handle @Input changes (important if product input can change)
  async ngOnChanges(changes: SimpleChanges) {
    if (changes['product']) {
    }
  }

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

  async onToggleWishlist() {
    this.product.isWishlisted = !this.product.isWishlisted;
    await this.wishlistService.toggleWishlist(this.product);
    this.cdr.detectChanges();
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = this.placeholder;
  }
}
