import { Component, OnInit } from '@angular/core';
import { Banner } from '../../../internal/End-user/banner/banner';
import { Product } from '../../../internal/End-user/product/product';
import { ProductSM } from '../../../../../models/service-models/app/v1/product-s-m';
import { Router } from '@angular/router';
import { BaseComponent } from '../../../../../base.component';
import { HomeViewModel } from '../../../../../models/view/end-user/home.viewmodel';
import { CommonService } from '../../../../../services/common.service';
import { LogHandlerService } from '../../../../../services/log-handler.service';
import { BannerService } from '../../../../../services/banner.service';

@Component({
  selector: 'app-home',
  imports: [Banner, Product],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home extends BaseComponent<HomeViewModel> implements OnInit {
  constructor(
    commonService: CommonService,
    logHandlerService: LogHandlerService,
    private router: Router,
    private bannerService: BannerService
  ) {
    super(commonService, logHandlerService);
    this.viewModel = new HomeViewModel();
  }

  async ngOnInit() {
    await this.getAllBanners();
  }
  dummyBanners = [
    {
      title: 'Welcome to Our Sale',
      description: 'Get up to 50% off selected items. Limited time only!',
      imageBase64:
        'https://images.unsplash.com/photo-1615478441828-1b28a6115394?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // replace with a real base64 image string
      link: 'https://example.com/sale',
      ctaText: 'Shop Now',
      bannerType: 'Sales' as const,
      isVisible: true,
    },
    {
      title: 'Exclusive Voucher',
      description: 'Use code SAVE20 to get 20% off your next purchase.',
      imageBase64:
        'https://plus.unsplash.com/premium_photo-1668677227454-213252229b73?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      link: 'https://example.com/voucher',
      ctaText: 'Redeem',
      bannerType: 'Voucher' as const,
      isVisible: true,
    },
    {
      title: 'Summer Collection',
      description: 'Discover our latest summer styles and trends.',
      imageBase64:
        'https://images.unsplash.com/photo-1722886689077-d22d8fc2a305?q=80&w=1025&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      bannerType: 'Slider' as const,
      isVisible: true,
    },
  ];
  // mock-products-by-banner-style.ts

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

  trackById(index: number, item: ProductSM) {
    // return item.id ?? item.sku;
  }

  onAddToCart(product: ProductSM) {
    // handle add to cart
  }

  openProduct(product: ProductSM) {
    this.router.navigate(['/product', product.id]);
  }

  toggleWishlist(product: ProductSM) {
    // handle wishlist toggle
  }

  async getAllBanners(): Promise<void> {
    try {
      this._commonService.presentLoading();
      let resp = await this.bannerService.getAllBanners(
        this.viewModel.bannerViewModel
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
        this.viewModel.banners = resp.successData;
      }
    } catch (error) {
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: 'An error occurred',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } finally {
      this._commonService.dismissLoader();
    }
  }
}
