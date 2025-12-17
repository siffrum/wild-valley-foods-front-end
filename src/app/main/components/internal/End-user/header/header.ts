import { CommonModule, NgIf } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../../../services/cart.service';
import { ProductSM } from '../../../../../models/service-models/app/v1/product-s-m';
import { Subscription } from 'rxjs';
import { WishlistService } from '../../../../../services/wishlist.service';
import { HeaderViewModel } from '../../../../../models/view/end-user/header.viewmodel';
import { BaseComponent } from '../../../../../base.component';
import { CategoryService } from '../../../../../services/category.service';
import { CommonService } from '../../../../../services/common.service';
import { LogHandlerService } from '../../../../../services/log-handler.service';
import { ProductUtils } from '../../../../../utils/product.utils';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header extends BaseComponent<HeaderViewModel> implements OnInit, OnDestroy {
  private cartSub: Subscription | null = null;
  private wishlistSub: Subscription | null = null;

  // Expose utils to template
  utils = ProductUtils;

  constructor(
    commonService: CommonService,
    logHandlerService: LogHandlerService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private cdr: ChangeDetectorRef
  ) {
    super(commonService, logHandlerService);
    this.viewModel = new HeaderViewModel();
  }

  ngOnInit(): void {
    // Subscribe to cart changes
    this.cartSub = this.cartService.cart$.subscribe((items) => {
      console.log('[Header] Cart updated:', items?.length, 'items');
      this.viewModel.cartItems = items || [];
      this.viewModel.subTotal = this.viewModel.cartItems.reduce((sum, item) => {
        const price = ProductUtils.getPrice(item);
        return sum + price * (item.cartQuantity || 1);
      }, 0);
      this.cdr.detectChanges();
    });

    // Subscribe to wishlist changes
    this.wishlistSub = this.wishlistService.wishlist$.subscribe((items) => {
      console.log('[Header] Wishlist updated:', items?.length, 'items');
      this.viewModel.wishListItems = items || [];
      this.cdr.detectChanges();
    });

    this.loadPageData();
  }

  trackById(_: number, item: any) {
    return item.id ?? item.name;
  }

  override async loadPageData(): Promise<void> {
    try {
      let resp = await this.categoryService.getAllCategories(
        this.viewModel.categoriesViewModel
      );
      if (resp.isError) {
        await this._exceptionHandler.logObject(resp.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: resp.errorData.displayMessage,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      } else {
        this.viewModel.categoriesViewModel.categories = resp.successData;
        this.cdr.detectChanges();
      }
    } catch (error) {
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: 'An error occurred',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
    this.wishlistSub?.unsubscribe();
  }

  async cartTotal() {
    return await this.cartService.cartTotal();
  }

  async getCartItems() {
    this.viewModel.cartItems = await this.cartService.getAll();
    this.cdr.detectChanges();
  }

  increment(item: ProductSM) {
    item.cartQuantity++;
    this.saveCart();
  }

  decrement(item: ProductSM) {
    if (item.cartQuantity > 1) {
      item.cartQuantity--;
      this.saveCart();
    }
  }

  async saveCart() {
    for (const item of this.viewModel.cartItems) {
      await this.cartService.updateCartItem(item.id, item.cartQuantity, item.selectedVariantId);
    }
    await this.getCartItems();
  }

  removeItem(item: ProductSM) {
    this.cartService.removeById(item.id, item.selectedVariantId);
    this.getCartItems();
  }

  getSelectedVariant(item: ProductSM): any {
    return ProductUtils.getSelectedVariant(item);
  }

  getItemPrice(item: ProductSM): number {
    return ProductUtils.getPrice(item);
  }
}
