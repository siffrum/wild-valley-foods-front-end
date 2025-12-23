import { CommonModule, NgIf } from '@angular/common';
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../../../services/cart.service';
import { ProductSM } from '../../../../../models/service-models/app/v1/product-s-m';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { WishlistService } from '../../../../../services/wishlist.service';
import { HeaderViewModel } from '../../../../../models/view/end-user/header.viewmodel';
import { BaseComponent } from '../../../../../base.component';
import { CategoryService } from '../../../../../services/category.service';
import { CommonService } from '../../../../../services/common.service';
import { LogHandlerService } from '../../../../../services/log-handler.service';
import { ProductService } from '../../../../../services/product.service';
import { ProductUtils } from '../../../../../utils/product.utils';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header
  extends BaseComponent<HeaderViewModel>
  implements OnInit, OnDestroy
{
  private cartSub: Subscription | null = null;
  private wishlistSub: Subscription | null = null;
  private searchSub: Subscription | null = null;
  private searchSubject = new Subject<string>();

  // Search state
  showSearchDropdown: boolean = false;
  searchQuery: string = '';
  searchResults: ProductSM[] = [];
  isSearching: boolean = false;

  // Best selling products for Shop dropdown
  bestSellingProducts: ProductSM[] = [];

  // Expose utils to template
  utils = ProductUtils;
  isOpenOffCanvasCategories: boolean = false;

  @ViewChild('searchInput', { static: false })
  searchInput?: ElementRef<HTMLInputElement>;

  constructor(
    commonService: CommonService,
    logHandlerService: LogHandlerService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private cdr: ChangeDetectorRef,
    private productService: ProductService,
    private router: Router
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

    // Setup debounced search
    this.searchSub = this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((query) => {
        this.performSearch(query);
      });

    this.loadPageData();
    this.loadBestSellingProducts();
  }
  toggleCategories() {
    this.isOpenOffCanvasCategories = !this.isOpenOffCanvasCategories;
    this.cdr.detectChanges();
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

  async loadBestSellingProducts(): Promise<void> {
    try {
      const resp = await this.productService.getAllIsBestSelling();
      if (!resp.isError && resp.successData) {
        // Limit to a reasonable number for dropdown (e.g., 8-10 products)
        this.bestSellingProducts = resp.successData.slice(0, 10);
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('[Header] Error loading best selling products:', error);
    }
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
    this.wishlistSub?.unsubscribe();
    this.searchSub?.unsubscribe();
  }

  // Search functionality
  toggleSearch(): void {
    this.showSearchDropdown = !this.showSearchDropdown;
    if (this.showSearchDropdown) {
      setTimeout(() => {
        // Try mobile search input first, then desktop
        const mobileInput = document.querySelector(
          '.mobile-search-dropdown .search-input'
        ) as HTMLInputElement;
        if (mobileInput) {
          mobileInput.focus();
        } else {
          this.searchInput?.nativeElement.focus();
        }
      }, 100);
    }
    this.cdr.detectChanges();
  }

  closeSearch(): void {
    this.showSearchDropdown = false;
    this.searchQuery = '';
    this.searchResults = [];
    this.cdr.detectChanges();
  }

  onSearchInput(event: any): void {
    const query = event.target.value.trim();
    this.searchQuery = query;

    if (query.length >= 3) {
      this.searchSubject.next(query);
    } else {
      this.searchResults = [];
      this.isSearching = false;
    }
    this.cdr.detectChanges();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.isSearching = false;
    this.searchInput?.nativeElement.focus();
    this.cdr.detectChanges();
  }

  private async performSearch(query: string): Promise<void> {
    if (!query || query.length < 3) {
      this.searchResults = [];
      this.isSearching = false;
      this.cdr.detectChanges();
      return;
    }

    this.isSearching = true;
    this.cdr.detectChanges();

    try {
      const resp = await this.productService.getAllProductsBySearchString(
        query
      );

      if (resp.isError) {
        this.searchResults = [];
      } else {
        this.searchResults = resp.successData || [];
      }
    } catch (error) {
      console.error('[Header] Search error:', error);
      this.searchResults = [];
    } finally {
      this.isSearching = false;
      this.cdr.detectChanges();
    }
  }

  navigateToShop(): void {
    if (this.searchQuery && this.searchQuery.trim().length >= 3) {
      this.router.navigate(['/shop'], {
        queryParams: { search: this.searchQuery.trim() },
      });
      this.closeSearch();
    }
  }

  navigateToProduct(product: ProductSM): void {
    this.router.navigate(['/product', product.id]);
    this.closeSearch();
  }

  getProductPrice(product: ProductSM): number {
    return ProductUtils.getPrice(product);
  }

  // Close search on outside click
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.showSearchDropdown) {
      // Check for desktop search dropdown
      const isDesktopSearch =
        target.closest('.search-dropdown') ||
        target.closest('.search-icon-link');
      // Check for mobile search dropdown or button
      const isMobileSearch =
        target.closest('.mobile-search-dropdown') ||
        (target.closest('.d-lg-none') &&
          target.closest('button[type="button"]') &&
          target.closest('button')?.querySelector('.bi-search'));

      // Don't close if clicking on overlay (it will close via overlay click handler)
      const isOverlay = target.classList.contains('search-overlay');

      if (!isDesktopSearch && !isMobileSearch && !isOverlay) {
        this.closeSearch();
      }
    }
  }

  // Close search on ESC key
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.showSearchDropdown) {
      this.closeSearch();
    }
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
      await this.cartService.updateCartItem(
        item.id,
        item.cartQuantity,
        item.selectedVariantId
      );
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
