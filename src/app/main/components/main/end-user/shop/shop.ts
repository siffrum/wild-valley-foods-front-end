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
import { ActivatedRoute, Router } from '@angular/router';
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
 
  minPrice: number | null = null;
  maxPrice: number | null = null;
  selectedCategory: number | null = null;
  inStockOnly = true;

  // pagination / sort
  pageSize = 30;
  currentPage = 1;
  totalPages = 1;
  selectedSort: string | null = null;

  // local caches
  cartItems: ProductSM[] = [];

  // rxjs
  private searchSubject = new Subject<string>();
  private subscriptions = new Subscription();

  constructor(
    commonService: CommonService,
    logHandler: LogHandlerService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private router: Router,
    private productService: ProductService,
    private categoryService: CategoryService,
    private activatedRoute: ActivatedRoute
  ) {
    super(commonService, logHandler);
    this.viewModel = new AdminProductsViewModel();

    this.viewModel.pagination.PageSize = this.pageSize;
    this.viewModel.pagination.PageNo = this.currentPage;
  }

  ngOnInit(): void {
    // ✅ Debounced search
    this.subscriptions.add(
      this.searchSubject.pipe(debounceTime(400)).subscribe(() => {
        this.currentPage = 1;
        if (this.viewModel.searchstring && this.viewModel.searchstring.trim().length > 0) {
          this.loadProductsPageDataBysearchString();
        } else {
          this.loadProductsByCategoryOrAll();
        }
      })
    );

    // ✅ Single subscription to route params
    this.subscriptions.add(
      this.activatedRoute.params.subscribe((params) => {
        if (params['categoryId'] && params['categoryName']) {
          this.viewModel.userProductViewModel.categoryId = +params['categoryId'];
          this.viewModel.PageTitle = params['categoryName'];
        } else {
          this.viewModel.PageTitle = 'All Products';
          this.viewModel.userProductViewModel.categoryId = 0;
        }

        // initial load
        if (!this.viewModel.searchstring) {
          this.loadProductsByCategoryOrAll();
        }
      })
    );
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
    this.router.navigate(['/product', product.id]);
  }

  /** wishlist & cart */
  async toggleWishlist(product: ProductSM) {
    await this.wishlistService.toggleWishlist(product);
  }

  async onAddToCart(product: ProductSM) {
    product.cartQuantity = product.cartQuantity || 1;
    await this.cartService.toggleCart(product);
    await this.getCartItems();
  }

  private async getCartItems() {
    this.cartItems = await this.cartService.getAll();
  }

  /** Called when filters/sort/pagination change */
  private async loadProductsByCategoryOrAll() {
    if (this.viewModel.userProductViewModel.categoryId) {
      await this.loadProductsPageDataByCategoryId();
    } else {
      await this.loadPageData();
    }
  }

  /** Sorting (works on current data set) */
  onSortChange(e: Event | null) {
    const val = (e?.target as HTMLSelectElement)?.value ?? '';
    this.selectedSort = val || null;

    if (this.viewModel.products?.length) {
      this.viewModel.products = this.sortProducts(this.viewModel.products, this.selectedSort);
    }
  }

  /** Sorting logic */
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

  /** Search handler */
  onSearchChange(_: any) {
    this.searchSubject.next(this.viewModel.searchstring);
  }

  /** Pagination */
  goToPage(page: number) {
    if (page < 1) page = 1;

    const totalCount = this.viewModel.pagination.totalCount || 0;
    this.totalPages = Math.max(1, Math.ceil(totalCount / this.pageSize));

    if (page > this.totalPages) page = this.totalPages;
    if (page === this.currentPage) return;

    this.currentPage = page;

    if (this.viewModel.searchstring) {
      this.loadProductsPageDataBysearchString();
    } else {
      this.loadProductsByCategoryOrAll();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // =============================
  // ✅ API CALLS
  // =============================

  override async loadPageData() {
    try {
      await this._commonService.presentLoading();
      this.viewModel.productFormData = this.viewModel.productFormData || ({} as any);
      (this.viewModel.productFormData as any).priceMin = this.minPrice;
      (this.viewModel.productFormData as any).priceMax = this.maxPrice;
      (this.viewModel.productFormData as any).inStockOnly = this.inStockOnly;

      const resp = await this.productService.getAllProducts(this.viewModel);

      if (resp.isError) {
        this.viewModel.products = [];
        this.viewModel.pagination.totalCount = 0;
      } else {
        this.viewModel.products = this.sortProducts(resp.successData || [], this.selectedSort);
        await this.TotalProductCount();
      }
    } finally {
      await this._commonService.dismissLoader();
    }
  }

  async loadProductsPageDataByCategoryId() {
    try {
      await this._commonService.presentLoading();
      this.viewModel.productFormData = this.viewModel.productFormData || ({} as any);
      (this.viewModel.productFormData as any).priceMin = this.minPrice;
      (this.viewModel.productFormData as any).priceMax = this.maxPrice;
      (this.viewModel.productFormData as any).inStockOnly = this.inStockOnly;

      const resp = await this.productService.getAllProductsByCategoryId(this.viewModel.userProductViewModel);

      if (resp.isError) {
        this.viewModel.products = [];
        this.viewModel.pagination.totalCount = 0;
      } else {
        this.viewModel.products = this.sortProducts(resp.successData || [], this.selectedSort);
        await this.TotalProductByCategoryIdCount();
      }
    } finally {
      await this._commonService.dismissLoader();
    }
  }

  async loadProductsPageDataBysearchString() {
    try {
      await this._commonService.presentLoading();
      const resp = await this.productService.getAllProductsBySearchString(this.viewModel.searchstring.trim());

      if (resp.isError) {
        this.viewModel.products = [];
        this.viewModel.pagination.totalCount = 0;
      } else {
        this.viewModel.products = [];
        this.viewModel.products = this.sortProducts(resp.successData || [], this.selectedSort);
        this.viewModel.pagination.totalCount = resp.successData.length || 0;
      }
    } finally {
      await this._commonService.dismissLoader();
    }
  }

  async TotalProductCount() {
    const resp = await this.productService.getTotatProductCount();
    this.viewModel.pagination.totalCount = resp.isError ? 0 : resp.successData.intResponse || 0;
    this.totalPages = Math.max(1, Math.ceil(this.viewModel.pagination.totalCount / this.pageSize));
  }

  async TotalProductByCategoryIdCount() {
    const resp = await this.productService.getTotatProductCountByCategoryId(this.viewModel.categoryId);
    this.viewModel.pagination.totalCount = resp.isError ? 0 : resp.successData.intResponse || 0;
    this.totalPages = Math.max(1, Math.ceil(this.viewModel.pagination.totalCount / this.pageSize));
  }
}
