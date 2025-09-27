import { Component, OnInit } from '@angular/core';
import { Banner } from '../../../internal/End-user/banner/banner';
import { ProductCardComponent } from '../../../internal/End-user/product/product';
import { ProductSM } from '../../../../../models/service-models/app/v1/product-s-m';
import { Router } from '@angular/router';
import { BaseComponent } from '../../../../../base.component';
import { HomeViewModel } from '../../../../../models/view/end-user/home.viewmodel';
import { CommonService } from '../../../../../services/common.service';
import { LogHandlerService } from '../../../../../services/log-handler.service';
import { BannerService } from '../../../../../services/banner.service';
import { CategoryComponent } from '../../../internal/End-user/category/category';
import { ServiceBanner } from '../../../internal/End-user/service-banner/service-banner';
import { Testimonial } from '../../../internal/End-user/testimonial/testimonial';
import { ProductService } from '../../../../../services/product.service';
import { CategoryService } from '../../../../../services/category.service';
import { WishlistService } from '../../../../../services/wishlist.service';
import { CartService } from '../../../../../services/cart.service';
import { Videos } from '../videos/videos';

@Component({
  selector: 'app-home',
  imports: [
    Banner,
    ProductCardComponent,
    CategoryComponent,
    ServiceBanner,
    Testimonial,
    Videos
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home extends BaseComponent<HomeViewModel> implements OnInit {
  constructor(
    commonService: CommonService,
    logHandlerService: LogHandlerService,
    private router: Router,
    private bannerService: BannerService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private wishlistService: WishlistService,
    private cartService: CartService
  ) {
    super(commonService, logHandlerService);
    this.viewModel = new HomeViewModel();
  }

  async ngOnInit() {
   await this.loadPageData();
  }

  override async loadPageData() {
    try {
    this._commonService.presentLoading();
    await this.getAllBanners();
    await this.getAllProducts();
    await this.getAllNewArrivals();
    } catch (error) {
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: 'An error occurred',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
    finally{
      this._commonService.dismissLoader();
    }

  }


  trackById(index: number, item: ProductSM) {
    // return item.id ?? item.sku;
  }

  async onAddToCart(product: ProductSM) {
    product.cartQuantity = 1;
    await this.cartService.toggleCart(product);
  }

  async toggleWishlist(product: ProductSM) {
    await this.wishlistService.toggleWishlist(product);
  }

  openProduct(product: ProductSM) {
    this.router.navigate(['/product', product.id]);
  }

  async getAllBanners(): Promise<void> {
    try {
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
    }
  }

  async getAllProducts(): Promise<void> {
    try {
      this.viewModel.productsViewModel.pagination.PageSize=8;
      let resp = await this.productService.getAllProducts(
        this.viewModel.productsViewModel
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
        this.viewModel.productsViewModel.products = resp.successData;
        await this.getAllCategories();
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
  async getAllNewArrivals(): Promise<void> {
    try {
      let resp = await this.productService.getAllNewArrivals();
      if (resp.isError) {
        await this._exceptionHandler.logObject(resp.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: resp.errorData.displayMessage,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      } else {
        this.viewModel.newArrivals = resp.successData;
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
  async getAllCategories(): Promise<void> {
    try {
      let resp = await this.categoryService.getAllCategories(
        this.viewModel.categoryViewModel
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
        this.viewModel.categoryViewModel.categories = resp.successData;
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
}
