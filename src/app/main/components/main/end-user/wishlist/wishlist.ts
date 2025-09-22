import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WishlistService } from '../../../../../services/wishlist.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { log } from 'console';
import { ProductSM } from '../../../../../models/service-models/app/v1/product-s-m';
import { BaseComponent } from '../../../../../base.component';
import { WishListViewModel } from '../../../../../models/view/end-user/wishlist.viewmodel';
import { CommonService } from '../../../../../services/common.service';
import { LogHandlerService } from '../../../../../services/log-handler.service';
import { CartService } from '../../../../../services/cart.service';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.html', // your template path
  styleUrls: ['./wishlist.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class WishlistComponent
  extends BaseComponent<WishListViewModel>
  implements OnInit
{
  constructor(
    commonService: CommonService,
    loghandlerService: LogHandlerService,
    private wishlistService: WishlistService,
    private cartService: CartService
  ) {
    super(commonService, loghandlerService);
    this.viewModel = new WishListViewModel();
  }

  async ngOnInit() {
    this.detectMobile();
    this.viewModel.allItems = await this.getAllWishlistItems();
    this.viewModel.totalCount = this.viewModel.allItems.length;
  }

  // call this on window resize if needed, or rely on CSS media queries
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
        this.cartService.toggleCart(item);
        this.viewModel.allItems = await this.getAllWishlistItems();
        this.viewModel.totalCount = this.viewModel.allItems.length;
      }
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
    }
  }

  shareItem(item: ProductSM) {
    const shareText = `${item.name} — ₹${item.price}`;
    if ((navigator as any).share) {
      (navigator as any)
        .share({
          title: item.name,
          text: shareText,
          url: window.location.href,
        })
        .catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard
        .writeText(`${shareText} — ${window.location.href}`)
        .then(() => alert('Link copied to clipboard'))
        .catch(() => alert('Could not copy link'));
    } else {
      alert('Share not supported in this browser');
    }
  }

  async removeFromWishlist(id: number) {
    await this.wishlistService.removeById(id);
    this.viewModel.allItems = await this.getAllWishlistItems();
    this.viewModel.totalCount = this.viewModel.allItems.length;
  }

  async applySearch() {
    if (this.viewModel.searchTerm) {
      this.viewModel.allItems = this.viewModel.allItems.filter((item) =>
        item.name
          .toLowerCase()
          .includes(this.viewModel.searchTerm.toLowerCase())
      );
    } else {
      this.viewModel.allItems = await this.getAllWishlistItems();
    }
  }

  async getAllWishlistItems() {
    return await this.wishlistService.getAll();
  }
}
