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
import { IndexDBStorageService } from '../../../../../services/indexdb.service';

@Component({
  selector: 'app-home',
  imports: [
    Banner,
    ProductCardComponent,
    CategoryComponent,
    ServiceBanner,
    Testimonial,
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
    private productService:ProductService,
    private categoryService:CategoryService,
    private indexDBStorageService:IndexDBStorageService
  ) {
    super(commonService, logHandlerService);
    this.viewModel = new HomeViewModel();
  }

  async ngOnInit() {
    await this.getAllBanners();
  }

  trackById(index: number, item: ProductSM) {
    // return item.id ?? item.sku;
  }

   async onAddToCart(product: ProductSM) {
    await this.indexDBStorageService.addToCart(product, 1);
    alert(`${product.name} added to cart ✅`);
  }

async toggleWishlist(product: ProductSM) {
  await this.indexDBStorageService.toggleWishlist(product);
  alert(`${product.name} wishlist updated ⭐`);
}

  openProduct(product: ProductSM) {
    this.router.navigate(['/product', product.id]);
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
        console.log(this.viewModel.banners);
        this.getAllProducts();
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

  
  async getAllProducts(): Promise<void> {
    try {
      this._commonService.presentLoading();
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
        console.log(this.viewModel.productsViewModel.products);
        this.getAllCategories();
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

    async getAllCategories(): Promise<void> {
    try {
      this._commonService.presentLoading();
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
        console.log(this.viewModel.categoryViewModel.categories);
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
