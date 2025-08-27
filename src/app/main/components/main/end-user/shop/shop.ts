import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { BaseComponent } from '../../../../../base.component';
import { ShopViewModel } from '../../../../../models/view/end-user/shop.viewmodel';
import { CommonService } from '../../../../../services/common.service';
import { LogHandlerService } from '../../../../../services/log-handler.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductComponent } from '../../admin/product-list/product-component/product-component';
import { ProductCardComponent } from '../../../internal/End-user/product/product';
import { ProductSM } from '../../../../../models/service-models/app/v1/product-s-m';

@Component({
  selector: 'app-shop',
  imports: [CommonModule, FormsModule, ProductCardComponent],
  templateUrl: './shop.html',
  styleUrl: './shop.scss',
  standalone: true,
})
export class Shop extends BaseComponent<ShopViewModel> implements OnInit {
  pageSize: number = 10;
  constructor(
    commonService: CommonService,
    logHandlerService: LogHandlerService
  ) {
    super(commonService, logHandlerService);
    this.viewModel = new ShopViewModel();
  }
  products: any[] = [];
  ngOnInit(): void {
    this.products = this.dummuyProducts;
    this.currentPage = 1;
    this.applyFilters();
  }

  // --- internal state ---
  searchText = '';
  selectedCategory: any = null;
  selectedSort: string | null = null;
  minPrice: number | null = null;
  maxPrice: number | null = null;
  inStockOnly = true;

  currentPage = 1;
  pagedProducts: any[] = [];
  totalItems = 0;
  totalPages = 1;
  categories = ['all', 'category1', 'category2'];

  // call this whenever products input changes (implement ngOnChanges or setter)
  ngOnChanges(changes: SimpleChanges) {
    if (changes['products']) {
      this.currentPage = 1;
      this.applyFilters();
    }
  }
  trackById(index: number, item: ProductSM) {
    // return item.id ?? item.sku;
  }

  openProduct(product: ProductSM) {
    // this.router.navigate(['/product', product.id]);
  }

  toggleWishlist(product: ProductSM) {
    // handle wishlist toggle
  }
  onAddToCart(product: ProductSM) {}
  /** MAIN: apply filters, sort and paginate */
  applyFilters() {
    this.pagedProducts = this.dummuyProducts;
    // if (!Array.isArray(this.products)) {
    //   this.pagedProducts = this.dummuyProducts;
    //   this.totalItems = 0;
    //   this.totalPages = 1;
    //   return;
    // }

    // 1) filter
    // let out = this.products.filter((p) => {
    //   // search
    //   if (this.searchText) {
    //     const q = this.searchText.toLowerCase();
    //     const inName = (p.name || '').toLowerCase().includes(q);
    //     const inSku = (p.sku || '').toLowerCase().includes(q);
    //     if (!inName && !inSku) return false;
    //   }
    //   // category
    //   if (
    //     this.selectedCategory !== null &&
    //     this.selectedCategory !== undefined
    //   ) {
    //     if (!p.category) return false;
    //     if (
    //       p.category.id != this.selectedCategory &&
    //       p.category.name != this.selectedCategory
    //     )
    //       return false;
    //   }
    //   // price
    //   if (this.minPrice != null && p.price < this.minPrice) return false;
    //   if (this.maxPrice != null && p.price > this.maxPrice) return false;
    //   // in-stock
    //   if (this.inStockOnly && p.inStock === false) return false;
    //   return true;
    // });

    // // 2) sort
    // out = this.sortProducts(out, this.selectedSort);

    // // 3) paginate
    // this.totalItems = out.length;
    // this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.pageSize));
    // if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    // const start = (this.currentPage - 1) * this.pageSize;
    // this.pagedProducts = out.slice(start, start + this.pageSize);
  }

  /** sort helper */
  sortProducts(list: any[], sortKey: string | null) {
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
  onSearchChange() {
    this.currentPage = 1;
    // you can debounce externally if desired
    this.applyFilters();
  }

  onSelectCategory(id: any) {
    this.selectedCategory = id;
    this.currentPage = 1;
    this.applyFilters();
  }

  onSortChange(val: Event | null) {
    // this.selectedSort = val || null;
    this.currentPage = 1;
    this.applyFilters();
  }

  onPriceApply() {
    // if inputs are bound as strings, convert to number first
    // ensure minPrice/maxPrice are numbers or null
    if (
      this.minPrice !== null &&
      this.minPrice !== undefined &&
      isNaN(Number(this.minPrice))
    )
      this.minPrice = null;
    if (
      this.maxPrice !== null &&
      this.maxPrice !== undefined &&
      isNaN(Number(this.maxPrice))
    )
      this.maxPrice = null;
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
    this.inStockOnly = false;
    this.currentPage = 1;
    this.applyFilters();
  }

  /** pagination */
  goToPage(page: number) {
    if (page < 1) page = 1;
    if (page > this.totalPages) page = this.totalPages;
    if (page === this.currentPage) return;
    this.currentPage = page;
    this.applyFilters();
  }

  dummuyProducts = [
    {
      id: 1,
      name: 'Organic Bananas (1 kg)',
      description:
        'Sweet organic bananas, locally sourced and ripened to perfection.',
      price: 79.0,
      sku: 'FR-0001',
      stock: 25,
      weight: 1,
      imageBase64:
        'https://images.unsplash.com/photo-1607664608695-45aaa6d621fc?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZHJ5JTIwZnJ1aXRzfGVufDB8fDB8fHww',
      link: 'https://example.com/products/101',
      ctaText: 'Buy Now',
      badge: 'Popular',
      categoryId: 1,
      category: {
        id: 1,
        name: 'Fruits & Vegetables',
        description: 'Fresh produce',
        status: 'active',
      },
      isVisible: true,
    },
    {
      id: 102,
      name: 'Red Apples (1 kg)',
      description: 'Crisp red apples — ideal for snacking and baking.',
      price: 129.0,
      sku: 'FR-0002',
      stock: 12,
      weight: 1,
      imageBase64: '',
      link: 'https://example.com/products/102',
      ctaText: 'Buy Now',
      badge: 'Fresh',
      categoryId: 1,
      category: {
        id: 1,
        name: 'Fruits & Vegetables',
        description: 'Fresh produce',
        status: 'active',
      },
      isVisible: true,
    },
    {
      id: 103,
      name: 'Baby Spinach (250 g)',
      description: 'Tender baby spinach — great for salads and smoothies.',
      price: 39.0,
      sku: 'VG-0010',
      stock: 0,
      weight: 0.25,
      imageBase64:
        'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3',
      link: 'https://example.com/products/103',
      ctaText: 'Notify Me',
      badge: 'Out of Stock',
      categoryId: 1,
      category: {
        id: 1,
        name: 'Fruits & Vegetables',
        description: 'Fresh produce',
        status: 'active',
      },
      isVisible: true,
    },
    {
      id: 201,
      name: 'Full Cream Milk (1 L)',
      description: 'Farm-fresh full cream milk, pasteurized for safety.',
      price: 59.0,
      sku: 'DA-0100',
      stock: 40,
      weight: 1,
      imageBase64:
        'https://images.unsplash.com/photo-1582515073490-399813b4c0a6?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3',
      link: 'https://example.com/products/201',
      ctaText: 'Add to Cart',
      badge: '',
      categoryId: 2,
      category: {
        id: 2,
        name: 'Dairy & Eggs',
        description: 'Milk, cheese, eggs',
        status: 'active',
      },
      isVisible: true,
    },
    {
      id: 202,
      name: 'Paneer (200 g)',
      description: 'Soft, fresh paneer — perfect for Indian curries.',
      price: 89.0,
      sku: 'DA-0101',
      stock: 8,
      weight: 0.2,
      imageBase64:
        'https://images.unsplash.com/photo-1604908177522-8a59cb3e3a37?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3',
      link: 'https://example.com/products/202',
      ctaText: 'Add to Cart',
      badge: 'Sale',
      categoryId: 2,
      category: {
        id: 2,
        name: 'Dairy & Eggs',
        description: 'Milk, cheese, eggs',
        status: 'active',
      },
      isVisible: true,
    },
    {
      id: 301,
      name: 'Premium Almonds (250 g)',
      description: 'California almonds — raw, crunchy and nutrient-packed.',
      price: 249.0,
      sku: 'NR-1001',
      stock: 5,
      weight: 0.25,
      imageBase64:
        'https://images.unsplash.com/photo-1506806732259-39c2d0268443?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3',
      link: 'https://example.com/products/301',
      ctaText: 'Buy Now',
      badge: 'Hot',
      categoryId: 3,
      category: {
        id: 3,
        name: 'Nuts & Dry Fruits',
        description: 'Healthy snacks',
        status: 'active',
      },
      isVisible: true,
    },
    {
      id: 401,
      name: 'Organic Honey (500 g)',
      description: 'Raw organic honey — unprocessed and naturally sweet.',
      price: 399.0,
      sku: 'OT-2001',
      stock: 2,
      weight: 0.5,
      imageBase64:
        'https://images.unsplash.com/photo-1510626176961-4b57b3b1c5cf?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3',
      link: 'https://example.com/products/401',
      ctaText: 'Buy Now',
      badge: 'Organic',
      categoryId: 4,
      category: {
        id: 4,
        name: 'Pantry',
        description: 'Staples and pantry items',
        status: 'active',
      },
      isVisible: true,
    },
    {
      id: 402,
      name: 'Masala Tea (100 g)',
      description: 'Aromatic masala tea blend — bold flavour in every cup.',
      price: 119.0,
      sku: 'BT-3001',
      stock: 18,
      weight: 0.1,
      imageBase64:
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3',
      link: 'https://example.com/products/402',
      ctaText: 'Buy Now',
      badge: '',
      categoryId: 4,
      category: {
        id: 4,
        name: 'Pantry',
        description: 'Staples and pantry items',
        status: 'active',
      },
      isVisible: true,
    },
    {
      id: 999,
      name: 'Sample Promo Item',
      description: 'Promotional sample — not for sale.',
      price: 0.0,
      sku: 'PROMO-000',
      stock: 0,
      weight: 0,
      imageBase64: 'https://placehold.co/600x400?text=Promo+Item',
      link: 'https://example.com/promo',
      ctaText: 'Learn More',
      badge: 'Promo',
      categoryId: 0,
      category: {
        id: 0,
        name: 'Promotions',
        description: 'Promotional items',
        status: 'inactive',
      },
      isVisible: false,
    },
  ];
}
