import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { WishlistService } from '../../../../../services/wishlist.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductSM } from '../../../../../models/service-models/app/v1/product-s-m';
import { BaseComponent } from '../../../../../base.component';
import { WishListViewModel } from '../../../../../models/view/end-user/wishlist.viewmodel';
import { CommonService } from '../../../../../services/common.service';
import { LogHandlerService } from '../../../../../services/log-handler.service';
import { CartService } from '../../../../../services/cart.service';
import { ProductUtils } from '../../../../../utils/product.utils';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.html',
  styleUrls: ['./wishlist.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class WishlistComponent
  extends BaseComponent<WishListViewModel>
  implements OnInit, OnDestroy
{
  // Expose utils to template
  utils = ProductUtils;
  
  private wishlistSub?: Subscription;
  private originalItems: ProductSM[] = [];

  constructor(
    commonService: CommonService,
    loghandlerService: LogHandlerService,
    private wishlistService: WishlistService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {
    super(commonService, loghandlerService);
    this.viewModel = new WishListViewModel();
  }

  async ngOnInit() {
    this.detectMobile();
    
    // Subscribe to wishlist changes
    this.wishlistSub = this.wishlistService.wishlist$.subscribe((items) => {
      console.log('[WishlistPage] Received wishlist update:', items?.length, 'items');
      this.originalItems = items || [];
      this.viewModel.allItems = [...this.originalItems];
      this.viewModel.totalCount = this.viewModel.allItems.length;
      this.cdr.detectChanges();
    });
    
    // Initial load
    await this.loadWishlist();
  }
  
  ngOnDestroy(): void {
    this.wishlistSub?.unsubscribe();
  }
  
  private async loadWishlist() {
    console.log('[WishlistPage] Loading wishlist...');
    const items = await this.wishlistService.getAll();
    console.log('[WishlistPage] Loaded', items.length, 'items');
    this.originalItems = items;
    this.viewModel.allItems = [...items];
    this.viewModel.totalCount = items.length;
    this.cdr.detectChanges();
  }

  detectMobile() {
    try {
      this.viewModel.isMobile = window.innerWidth <= 768;
    } catch {
      this.viewModel.isMobile = false;
    }
  }

  async moveToCart(item: ProductSM) {
    try {
      const removed = await this.wishlistService.removeById(item.id);
      if (removed) {
        await this.cartService.toggleCart(item);
      }
    } catch (error) {
      console.error('Error moving item to cart:', error);
    }
  }

  shareItem(item: ProductSM) {
    const variant = ProductUtils.getSelectedVariant(item);
    if (!variant) return;

    const unitText = variant.unitSymbol
      ? `${variant.quantity}${variant.unitSymbol}`
      : `${variant.quantity}`;

    const price = variant.price;

    const shareText = `${item.name} (${unitText}) — ₹${price}`;

    const shareUrl =
      `${window.location.origin}/product/${item.id}?variant=${variant.id}`;

    if ((navigator as any).share) {
      (navigator as any)
        .share({
          title: item.name,
          text: shareText,
          url: shareUrl,
        })
        .catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard
        .writeText(`${shareText} — ${shareUrl}`)
        .then(() => this._commonService.ShowToastAtTopEnd('Link copied!', 'success'))
        .catch(() =>
          this._commonService.ShowToastAtTopEnd('Could not copy link', 'error')
        );
    } else {
      this._commonService.ShowToastAtTopEnd(
        'Sharing not supported in this browser',
        'info'
      );
    }
  }

  /**
   * Remove item from wishlist
   */
  async removeFromWishlist(id: number, variantId?: number) {
    await this.wishlistService.removeById(id);
  }

  async applySearch() {
    if (this.viewModel.searchTerm && this.viewModel.searchTerm.trim()) {
      const searchLower = this.viewModel.searchTerm.toLowerCase();
      this.viewModel.allItems = this.originalItems.filter((item) =>
        item.name.toLowerCase().includes(searchLower)
      );
    } else {
      this.viewModel.allItems = [...this.originalItems];
    }
    this.cdr.detectChanges();
  }

  async getAllWishlistItems() {
    return await this.wishlistService.getAll();
  }
}
