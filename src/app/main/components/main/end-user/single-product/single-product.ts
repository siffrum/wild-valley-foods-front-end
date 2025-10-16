import { Component, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BaseComponent } from '../../../../../base.component';
import { UserProductViewModel } from '../../../../../models/view/end-user/product/user-product.viewmodel';
import { ProductSM } from '../../../../../models/service-models/app/v1/product-s-m';

import { ProductService } from '../../../../../services/product.service';
import { CommonService } from '../../../../../services/common.service';
import { LogHandlerService } from '../../../../../services/log-handler.service';
import { CartService } from '../../../../../services/cart.service';
import { WishlistService } from '../../../../../services/wishlist.service';

import { ProductCardComponent } from '../../../internal/End-user/product/product';

@Component({
  selector: 'app-product-page',
  templateUrl: './single-product.html',
  styleUrls: ['./single-product.scss'],
  imports: [RouterModule, CommonModule, FormsModule, ProductCardComponent],
})
export class SingleProduct
  extends BaseComponent<UserProductViewModel>
  implements OnInit
{
  constructor(
    commonService: CommonService,
    private logHandlerService: LogHandlerService,
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private router: Router,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {
    super(commonService, logHandlerService);
    this.viewModel = new UserProductViewModel();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this._commonService.dismissLoader();
      }
    });
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      if (params['id']) {
        this.loadProductData(+params['id']);
      }
    });
    //

    this.calculateAverageRating();
  }
  toggleReviews(): void {
    this.viewModel.showReviews = !this.viewModel.showReviews;
  }

  calculateAverageRating(): void {
    if (this.viewModel.reviewsSM.length > 0) {
      const total = this.viewModel.reviewsSM.reduce(
        (sum, r) => sum + r.rating,
        0
      );
      this.viewModel.averageRating = total / this.viewModel.reviewsSM.length;
    } else {
      this.viewModel.averageRating = 0;
    }
  }

  openAddReviewModal(): void {
    this._commonService.ShowToastAtTopEnd('Feature coming soon...', 'info');
  }

  showFullRichDesc = false;

  toggleRichDesc() {
    this.showFullRichDesc = !this.showFullRichDesc;
  }

  selectImage(index: number) {
    this.viewModel.selectedImageIndex = index;
  }
  /**
   * Main entry point for loading product + related data
   */
  private async loadProductData(id: number): Promise<void> {
    await this._commonService.presentLoading();
    try {
      await this.getProductById(id);
      await this.getCartItemById(id);
      await this.loadSimilarProductsByCategory();
      await this.getProductReviews(id);
    } catch (error) {
      await this._exceptionHandler.logObject(error);
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: 'Failed to load product details.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } finally {
      await this._commonService.dismissLoader();
    }
  }

  /**
   * Get single product by ID
   */
  private async getProductById(id: number): Promise<void> {
    const resp = await this.productService.getProductById(id);
    if (resp.isError) {
      throw resp.errorData;
    }
    this.viewModel.product = resp.successData;
    this.viewModel.categoryId = this.viewModel.product.categoryId;
  }
  private async getProductReviews(id: number): Promise<void> {
    const resp = await this.productService.getProductReviews(id);
    if (resp.isError) {
      this._commonService.ShowToastAtTopEnd(
        resp.errorData.displayMessage,
        'error'
      );
      return;
    }
    this.viewModel.reviewsSM = resp.successData;
    this.calculateAverageRating();
  }

  /**
   * Sync cart info with current product
   */
  private async getCartItemById(id: number): Promise<void> {
    const items = await this.cartService.getAll();
    const found = items.find((item) => item.id === id);
    if (found) {
      this.viewModel.product = found;
    } else {
      this.viewModel.product.cartQuantity = 1;
    }
  }

  /**
   * Load related products by category
   */
  private async loadSimilarProductsByCategory(): Promise<void> {
    try {
      this.viewModel.pagination.PageSize = 4;
      const resp = await this.productService.getAllProductsByCategoryId(
        this.viewModel
      );

      if (resp.isError) {
        await this.logHandlerService.logObject(resp.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: resp.errorData.displayMessage,
          icon: 'error',
          confirmButtonText: 'OK',
        });
        return;
      }

      this.viewModel.products = resp.successData;
      this.viewModel.filteredProducts = [...resp.successData];
      await this.TotalProductCountByCategoryId();
    } catch (error) {
      await this.logHandlerService.logObject(error);
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: 'Failed to load similar products.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  }

  /**
   * Get total product count by category
   */
  private async TotalProductCountByCategoryId(): Promise<void> {
    try {
      const resp = await this.productService.getTotatProductCountByCategoryId(
        this.viewModel.product.categoryId
      );

      if (resp.isError) {
        await this.logHandlerService.logObject(resp.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: resp.errorData.displayMessage,
          icon: 'error',
          confirmButtonText: 'OK',
        });
        return;
      }

      this.viewModel.pagination.totalCount = resp.successData.intResponse;
    } catch (error) {
      await this.logHandlerService.logObject(error);
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: 'Failed to load product count.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  }

  /**
   * Cart Methods
   */
  increment(item: ProductSM): void {
    item.cartQuantity++;
    this.saveCart();
  }

  decrement(item: ProductSM): void {
    if (item.cartQuantity > 1) {
      item.cartQuantity--;
      this.saveCart();
    }
  }

  async onAddToCart(product: ProductSM): Promise<void> {
    await this.cartService.toggleCart(product);
  }

  private async saveCart(): Promise<void> {
    for (const item of this.viewModel.cartItems) {
      await this.cartService.updateCartItem(item.id, item.cartQuantity);
    }
    await this.getCartItems();
  }

  private async getCartItems(): Promise<void> {
    this.viewModel.cartItems = await this.cartService.getAll();
  }

  removeItem(item: ProductSM): void {
    this.cartService.removeById(item.id);
    this.getCartItems();
  }

  buyNow(): void {
    if (!this.viewModel.product) return;
    this.cartService.toggleCart(this.viewModel.product);
    this.router.navigate(['/checkout']);
  }

  /**
   * Wishlist
   */
  async toggleWishlist(product: ProductSM): Promise<void> {
    await this.wishlistService.toggleWishlist(product);
  }

  openProduct(product: ProductSM): void {
    this._commonService.presentLoading();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.router.navigate(['/product', product.id]);
  }

  shareProduct(): void {
    if (!this.viewModel.product) return;

    const shareData = {
      title: this.viewModel.product.name,
      text: `${this.viewModel.product.name} — ${
        this.viewModel.product.description ?? ''
      }`,
      url: window.location.href,
    };

    if ((navigator as any).share) {
      (navigator as any).share(shareData).catch(() => {
        this._commonService.ShowToastAtTopEnd('Error sharing', 'error');
      });
    } else {
      navigator.clipboard?.writeText(window.location.href);
      this._commonService.ShowToastAtTopEnd(
        'Link copied to clipboard',
        'success'
      );
    }
  }

  /**
   * Placeholder for sorting
   */
  sortData(): void {
    throw new Error('Method not implemented.');
  }
}
