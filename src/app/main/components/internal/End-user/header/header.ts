import { CommonModule, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class Header extends BaseComponent<HeaderViewModel> implements OnInit {
  private sub: Subscription | null = null;
  private wishListSub: Subscription | null = null;

  constructor(
    commonService: CommonService,
    logHandlerService: LogHandlerService,
    private categoryService: CategoryService,
      private cartService: CartService,
    private wishlistService: WishlistService
  ) {
    super(commonService, logHandlerService);
    this.viewModel = new HeaderViewModel();
  }
  ngOnInit(): void {
    this.sub = this.cartService.cart$.subscribe((items) => {
      this.viewModel.cartItems = items || [];
      // optionally compute subtotal live here
      this.viewModel.subTotal = this.viewModel.cartItems.reduce(
        (sum, item) => sum + (item.price ?? 0) * item.cartQuantity,
        0
      );
    });
    this.wishListSub = this.wishlistService.wishlist$.subscribe((items) => {
      this.viewModel.wishListItems = items || [];
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
    this.sub?.unsubscribe();
    this.wishListSub?.unsubscribe();
  }
  // Compute total price
  async cartTotal() {
    return await this.cartService.cartTotal();
  }
  async getCartItems() {
    this.viewModel.cartItems = await this.cartService.getAll();
    // console.log(this.viewModel.cartItems);
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
      await this.cartService.updateCartItem(item.id, item.cartQuantity);
    }
    await this.getCartItems();
  }

  removeItem(item: ProductSM) {
    this.cartService.removeById(item.id);
    this.getCartItems();
  }
}
