import { Component, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

import { BaseComponent } from '../../../../../base.component';
import { UserProductViewModel } from '../../../../../models/view/end-user/product/user-product.viewmodel';
import { ProductSM } from '../../../../../models/service-models/app/v1/product-s-m';

import { ProductService } from '../../../../../services/product.service';
import { CommonService } from '../../../../../services/common.service';
import { LogHandlerService } from '../../../../../services/log-handler.service';
import { CartService } from '../../../../../services/cart.service';
import { WishlistService } from '../../../../../services/wishlist.service';

import { ProductCardComponent } from '../../../internal/End-user/product/product';
import { ReviewSM } from '../../../../../models/service-models/app/v1/review-s-m';
import { ReviewService } from '../../../../../services/review.service';
import { ProductUtils } from '../../../../../utils/product.utils';

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
  // Expose utils to template
  utils = ProductUtils;

  constructor(
    commonService: CommonService,
    private logHandlerService: LogHandlerService,
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private router: Router,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private reviewService: ReviewService
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

  showReviewModal = false;
  openAddReviewModal(): void {
    this.showReviewModal = true;
  }

  submitReview(reviewForm: NgForm) {
    if (!reviewForm.invalid) {
      this.showReviewModal = false;
      this.viewModel.reviewFormData = reviewForm.value;
      this.viewModel.reviewFormData.rating = this.rating;
      this.viewModel.reviewFormData.productId = this.viewModel.product.id;
      this.addReview(this.viewModel.reviewFormData);
    }
  }

  async addReview(form: ReviewSM) {
    let resp = await this.reviewService.addReview(form);
    if (resp.isError) {
      await this._exceptionHandler.logObject(resp.errorData);
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: resp.errorData.displayMessage,
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } else {
      await this.getProductReviews(this.viewModel.product.id);
    }
  }

  closeModal() {
    this.showReviewModal = false;
  }

  toggleRichDesc() {
    this.viewModel.showFullRichDesc = !this.viewModel.showFullRichDesc;
  }

  selectImage(index: number) {
    this.viewModel.selectedImageIndex = index;
  }

  rating = 0;
  ratingText = '';

  ratingMessages: any = {
    0.5: 'Very Poor 😠',
    1: 'Poor 😟',
    1.5: 'Below Average 😕',
    2: 'Not Good 😐',
    2.5: 'Average 🙂',
    3: 'Okay 🙂',
    3.5: 'Good 🙂👍',
    4: 'Very Good 😄',
    4.5: 'Excellent 😍',
    5: 'Outstanding 🤩🔥',
  };

  setRating(value: number) {
    this.rating = Math.max(0.5, Math.min(5, value));
    this.ratingText = this.ratingMessages[this.rating] || '';
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

    // Check URL for variant parameter
    const variantIdParam = this.activatedRoute.snapshot.queryParams['variant'];
    if (variantIdParam) {
      const variantId = Number(variantIdParam);
      const variant = this.viewModel.product.variants?.find(
        (v) => v.id === variantId
      );
      if (variant) {
        this.viewModel.product.selectedVariantId = variantId;
      } else {
        this.initializeSelectedVariant();
      }
    } else {
      this.initializeSelectedVariant();
    }
    
    // Update maxQty based on selected variant
    const selectedVariant = ProductUtils.getSelectedVariant(this.viewModel.product);
    if (selectedVariant) {
      this.viewModel.maxQty = selectedVariant.stock || 1;
    }
  }

  /**
   * Initialize selected variant to default variant
   */
  private initializeSelectedVariant(): void {
    ProductUtils.initializeSelectedVariant(this.viewModel.product);
    const selectedVariant = ProductUtils.getSelectedVariant(this.viewModel.product);
    if (selectedVariant) {
      this.viewModel.maxQty = selectedVariant.stock || 1;
    }
  }

  /**
   * Handle variant selection change
   */
  onVariantChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const variantId = Number(select.value);
    this.viewModel.product.selectedVariantId = variantId;

    // Update max quantity based on variant stock
    const selectedVariant = ProductUtils.getSelectedVariant(this.viewModel.product);
    if (selectedVariant) {
      this.viewModel.maxQty = selectedVariant.stock || 1;
      if (this.viewModel.product.cartQuantity > this.viewModel.maxQty) {
        this.viewModel.product.cartQuantity = this.viewModel.maxQty;
      }
    }
  }

  /**
   * Get selected variant using utility
   */
  get selectedVariant(): any {
    return ProductUtils.getSelectedVariant(this.viewModel.product);
  }

  /**
   * Get available variants for dropdown
   */
  get availableVariants(): any[] {
    return this.viewModel.product?.variants || [];
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
    this.viewModel.reviewsSM = resp.successData.filter((x) => x.isApproved);
    this.calculateAverageRating();
  }

  getFullStars(): number {
    return Math.floor(this.viewModel.averageRating);
  }

  hasHalfStar(): boolean {
    return this.viewModel.averageRating % 1 >= 0.5;
  }

  /**
   * Sync cart info with current product
   */
  private async getCartItemById(id: number): Promise<void> {
    const items = await this.cartService.getAll();
    const found = this.viewModel.product.selectedVariantId
      ? items.find(
          (item) =>
            item.id === id &&
            item.selectedVariantId === this.viewModel.product.selectedVariantId
        )
      : items.find((item) => item.id === id);

    if (found) {
      this.viewModel.product.cartQuantity = found.cartQuantity;
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
    if (item.cartQuantity < this.viewModel.maxQty) {
      item.cartQuantity++;
      this.saveCart();
    }
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
   * Handle wishlist event from product card.
   * Note: The ProductCardComponent already toggles the wishlist internally.
   */
  onWishlistChanged(product: ProductSM): void {
    console.log('[SingleProduct] Wishlist changed for:', product.name, '- isWishlisted:', product.isWishlisted);
  }

  openProduct(product: ProductSM): void {
    this._commonService.presentLoading();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.router.navigate(['/product', product.id]);
  }

  /**
   * Share product with variant info
   */
  shareProduct(): void {
    if (!this.viewModel.product) return;

    let shareUrl =
      window.location.origin + `/product/${this.viewModel.product.id}`;
    if (this.viewModel.product.selectedVariantId) {
      shareUrl += `?variant=${this.viewModel.product.selectedVariantId}`;
    }

    const variant = ProductUtils.getSelectedVariant(this.viewModel.product);
    const variantInfo = variant
      ? ` - ${variant.quantity}${variant.unitSymbol || ''} - ${this.viewModel.product.currency}${ProductUtils.getPrice(this.viewModel.product)}`
      : '';

    const shareData = {
      title: this.viewModel.product.name,
      text: `${this.viewModel.product.name}${variantInfo} — ${
        this.viewModel.product.description ?? ''
      }`,
      url: shareUrl,
    };

    if ((navigator as any).share) {
      (navigator as any).share(shareData).catch(() => {
        this._commonService.ShowToastAtTopEnd('Error sharing', 'error');
      });
    } else {
      navigator.clipboard?.writeText(shareUrl);
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
