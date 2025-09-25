import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../../../services/product.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseComponent } from '../../../../../base.component';
import { SingleProductViewModel } from '../../../../../models/view/end-user/product/single-product.viewmodel';
import { CommonService } from '../../../../../services/common.service';
import { LogHandlerService } from '../../../../../services/log-handler.service';
import { CartService } from '../../../../../services/cart.service';
import { WishlistService } from '../../../../../services/wishlist.service';
import { ProductSM } from '../../../../../models/service-models/app/v1/product-s-m';
import { log } from 'console';

@Component({
  selector: 'app-product-page',
  templateUrl: './single-product.html',
  styleUrls: ['./single-product.scss'],
  imports: [RouterModule, CommonModule, FormsModule],
})
export class SingleProduct
  extends BaseComponent<SingleProductViewModel>
  implements OnInit
{
  constructor(
    commonService: CommonService,
    logHandlerService: LogHandlerService,
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {
    super(commonService, logHandlerService);
    this.viewModel = new SingleProductViewModel();
  }
  cartItems: ProductSM[] = [];
  async ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.getProductById(params['id']);
      }
    });
  }

  async getProductById(id: number) {
    try {
      await this._commonService.presentLoading();
      let resp = await this.productService.getProductById(id);
      await this._commonService.dismissLoader();
      if (resp.isError == false) {
        this.viewModel.product = resp.successData;
        await this.getCartItemById(id);
      } else {
        this._commonService.showSweetAlert({
          title: 'Error',
          text: resp.errorData?.displayMessage || 'An error occurred',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      this._commonService.dismissLoader();
      await this._exceptionHandler.logObject(error);
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: 'Failed to load product.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  }
  async getCartItemById(id: number) {
    let items = await this.cartService.getAll();
    let found = items.find((item) => item.id == id);
    if (found) {
      this.viewModel.product = found;
    } else {
      this.viewModel.product.cartQuantity = 1;
    }
  }
  selectImage(index: number) {}
  increment(item: ProductSM) {
    item.cartQuantity++;
    this.saveCart();
  }
  async onAddToCart(product: ProductSM) {
    await this.cartService.toggleCart(product);
  }
  decrement(item: ProductSM) {
    if (item.cartQuantity > 1) {
      item.cartQuantity--;
      this.saveCart();
    }
  }

  async saveCart() {
    for (const item of this.cartItems) {
      await this.cartService.updateCartItem(item.id, item.cartQuantity);
    }
    await this.getCartItems();
  }
  async getCartItems() {
    this.cartItems = await this.cartService.getAll();
    console.log(this.cartItems);
  }
  removeItem(item: ProductSM) {
    this.cartService.removeById(item.id);
    this.getCartItems();
  }

  buyNow() {
    if (!this.viewModel.product) return;
    this.cartService.toggleCart(this.viewModel.product);
    this.router.navigate(['/checkout']);
  }

  shareProduct() {
    if (!this.viewModel.product) return;
    const shareData = {
      title: this.viewModel.product.name,
      text: `${this.viewModel.product.name} — ${
        this.viewModel.product.description ?? ''
      }`,
      url: window.location.href,
    };
    if ((navigator as any).share) {
      (navigator as any).share(shareData).catch((e: any) => {
        this._commonService.ShowToastAtTopEnd('Error sharing', 'error');
      });
    } else {
      // fallback copy url
      navigator.clipboard?.writeText(window.location.href);
      this._commonService.ShowToastAtTopEnd(
        'Link copied to clipboard',
        'success'
      );
    }
  }
}
