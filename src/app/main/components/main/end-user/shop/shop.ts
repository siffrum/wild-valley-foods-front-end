import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { BaseComponent } from '../../../../../base.component';
import { AdminProductsViewModel } from '../../../../../models/view/Admin/admin-product.viewmodel';
import { CommonService } from '../../../../../services/common.service';
import { LogHandlerService } from '../../../../../services/log-handler.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../../../internal/End-user/product/product';
import { ProductSM } from '../../../../../models/service-models/app/v1/product-s-m';
import { CartService } from '../../../../../services/cart.service';
import { WishlistService } from '../../../../../services/wishlist.service';
import { Router } from '@angular/router';
import { ProductService } from '../../../../../services/product.service';
import { CategoryService } from '../../../../../services/category.service';
import { CategorySM } from '../../../../../models/service-models/app/v1/categories-s-m';

import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-shop',
  imports: [CommonModule, FormsModule, ProductCardComponent],
  templateUrl: './shop.html',
  styleUrl: './shop.scss',
  standalone: true,
})
export class Shop extends BaseComponent<AdminProductsViewModel> implements OnInit, OnDestroy {
  // UI / filter state
  searchText = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  selectedCategory: number | null = null;
  inStockOnly = true;

  // pagination / sort
  pageSize = 12;
  currentPage = 1;
  totalPages = 1;
  selectedSort: string | null = null;

  // local caches
  cartItems: ProductSM[] = [];

  // rxjs
  private searchSubject = new Subject<string>();
  private subscriptions = new Subscription();
  _logHandler: any;

  constructor(
    commonService: CommonService,
    logHandler: LogHandlerService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private router: Router,
    private productService: ProductService,
    private categoryService: CategoryService
  ) {
    super(commonService, logHandler);
    this.viewModel = new AdminProductsViewModel();

    // init pagination in viewModel if missing
    this.viewModel.pagination.PageSize = this.pageSize;
    this.viewModel.pagination.PageNo = this.currentPage;
  }

  ngOnInit(): void {
    // debounce search input
    this.subscriptions.add(
      this.searchSubject.pipe(debounceTime(350)).subscribe(() => {
        this.currentPage = 1;
        this.applyFilters();
      })
    );  // initial loads
    this.applyFilters();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /** trackBy helpers */
  trackByProduct(_: number, item: ProductSM) {
    return item?.id ?? item?.sku ?? _;
  }
  trackByCategory(_: number, item: CategorySM) {
    return item?.id ?? _;
  }

  /** Navigation */
  openProduct(product: ProductSM) {
    // rely on global router scroll restoration if configured
    this.router.navigate(['/product', product.id]);
  }

  /** wishlist & cart */
  async toggleWishlist(product: ProductSM) {
    await this.wishlistService.toggleWishlist(product);
  }

  async onAddToCart(product: ProductSM) {
    product.cartQuantity = product.cartQuantity || 1;
    await this.cartService.toggleCart(product);
    await this.getCartItems(); // refresh local cartItems if needed
  }

  private async getCartItems() {
    this.cartItems = await this.cartService.getAll();
  }

  /** MAIN: build filter request and call backend (or local filter) */
  applyFilters() {
    // Prepare viewModel with current filter state
    this.viewModel.searchTerm = this.searchText?.trim() ?? '';
    this.viewModel.categoryId = this.selectedCategory ?? 0;

    // price filters (add to viewModel if backend expects them)
    // we will put them in pagination or filter properties depending on your backend contract
    // For simplicity we assume backend reads from viewModel.productFormData or similar.
    // If not, adapt productService.getAllProducts signature accordingly.

    // pagination & sort
    this.viewModel.pagination.PageNo = this.currentPage;
    this.viewModel.pagination.PageSize = this.pageSize;

    // map selectedSort to sortField/sortDirection on viewModel
    if (!this.selectedSort || this.selectedSort === '') {
      this.viewModel.sortField = '';
      this.viewModel.sortDirection = 'asc';
    } else {
      const [field, dir] = this.selectedSort.split('_');
      if (field === 'price') {
        this.viewModel.sortField = 'price';
      } else if (field === 'name') {
        this.viewModel.sortField = 'name';
      } else {
        this.viewModel.sortField = field;
      }
      this.viewModel.sortDirection = dir === 'desc' ? 'desc' : 'asc';
    }

    // call server
    this.loadPageData();
  }

  /** sort helper (kept for possible client-side sorting use) */
  sortProducts(list: ProductSM[], sortKey: string | null): ProductSM[] {
    if (!sortKey) return list;
    const copy = [...list];
    if (sortKey === 'price_asc')
      copy.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    else if (sortKey === 'price_desc')
      copy.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    else if (sortKey === 'name_asc')
      copy.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    else if (sortKey === 'name_desc')
      copy.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    return copy;
  }

  /** UI handlers */
  onSearchChange(_: any) {
    // push to subject for debounce
    this.searchSubject.next(this.searchText);
  }

  onSelectCategory(id: number | null) {
    this.selectedCategory = id;
    this.currentPage = 1;
    this.applyFilters();
  }

  onSortChange(e: Event | null) {
    const val = (e?.target as HTMLSelectElement)?.value ?? '';
    this.selectedSort = val || null;
    this.currentPage = 1;
    this.applyFilters();
  }

  onPriceApply() {
    // sanitize numeric input
    if (this.minPrice !== null && isNaN(Number(this.minPrice))) this.minPrice = null;
    if (this.maxPrice !== null && isNaN(Number(this.maxPrice))) this.maxPrice = null;
    this.currentPage = 1;
    this.applyFilters();
  }

  onResetPrice() {
    this.minPrice = null;
    this.maxPrice = null;
    this.onPriceApply();
  }

  onToggleInStock() {
    this.currentPage = 1;
    this.applyFilters();
  }

  onResetFilters() {
    this.searchText = '';
    this.selectedCategory = null;
    this.selectedSort = null;
    this.minPrice = null;
    this.maxPrice = null;
    this.inStockOnly = true;
    this.currentPage = 1;
    this.applyFilters();
  }

  /** pagination */
  goToPage(page: number) {
    if (page < 1) page = 1;

    // compute total pages based on backend totalCount or local fallback
    const totalCount = this.viewModel.pagination.totalCount || 0;
    this.totalPages = Math.max(1, Math.ceil(totalCount / this.pageSize));

    if (page > this.totalPages) page = this.totalPages;
    if (page === this.currentPage) return;

    this.currentPage = page;
    this.applyFilters();
    // scroll top of products region for UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** Backend calls */
  override async loadPageData() {
    try {
      await this._commonService.presentLoading();

      // attach any additional filters the backend expects
      // Example: if backend expects price range, put it on viewModel.productFormData or a specific property
      // We'll use viewModel.productFormData.priceMin / priceMax for example
      // (Adjust if your backend uses different field names.)
      this.viewModel.productFormData = this.viewModel.productFormData || ({} as any);
      (this.viewModel.productFormData as any).priceMin = this.minPrice;
      (this.viewModel.productFormData as any).priceMax = this.maxPrice;
      (this.viewModel.productFormData as any).inStockOnly = this.inStockOnly;
      (this.viewModel.productFormData as any).searchTerm = this.searchText?.trim();

      // call API
      const resp = await this.productService.getAllProducts(this.viewModel);

      if (resp.isError) {
        await this._logHandler.logObject(resp.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: resp.errorData.displayMessage,
          icon: 'error',
          confirmButtonText: 'OK'
        });
        // ensure products cleared on error
        this.viewModel.products = [];
        this.viewModel.pagination.totalCount = 0;
      } else {
        // assume resp.successData is an array of products for the current page
        this.viewModel.products = resp.successData || [];

        // if backend returns totalCount separately, update viewModel.pagination.totalCount
        // If your backend provides it inside resp (e.g. resp.meta.totalCount), adapt accordingly.
        // Here we call TotalProductCount to keep compatibility with your previous code
        await this.TotalProductCount();
      }
    } catch (error) {
      await this._logHandler.logObject(error);
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: 'Failed to load products.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      await this._commonService.dismissLoader();
    }
  }

  async TotalProductCount() {
    try {
      // Note: Prefer returning totalCount inside getAllProducts to avoid another request.
      // Keeping separate call here because your previous code used it.
      const resp = await this.productService.getTotatProductCount();

      if (resp.isError) {
        await this._logHandler.logObject(resp.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: resp.errorData.displayMessage,
          icon: 'error',
          confirmButtonText: 'OK',
        });
        this.viewModel.pagination.totalCount = 0;
      } else {
        this.viewModel.pagination.totalCount = resp.successData.intResponse || 0;

        // update local pagination numbers
        this.totalPages = Math.max(1, Math.ceil(this.viewModel.pagination.totalCount / this.pageSize));

        // ensure current page bounds
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages;
          // refetch page if needed
          this.applyFilters();
        }
      }
    } catch (error) {
      await this._logHandler.logObject(error);
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: 'Failed to load product count.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      this.viewModel.pagination.totalCount = 0;
    }
  }
}
