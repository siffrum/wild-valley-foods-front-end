import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../../../../base.component';
import { CartViewModel } from '../../../../../models/view/end-user/cart.viewmodel';
import { CommonService } from '../../../../../services/common.service';
import { LogHandlerService } from '../../../../../services/log-handler.service';
import { IndexedDBStorageService } from '../../../../../services/indexdb.service';
import { ProductSM } from '../../../../../models/service-models/app/v1/product-s-m';
import { CartService } from '../../../../../services/cart.service';
import { log } from 'console';

@Component({
  selector: 'app-cart',
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class CartComponent
  extends BaseComponent<CartViewModel>
  implements OnInit
{
  constructor(
    commonService: CommonService,
    loghandler: LogHandlerService,
    private IndexDbStorageService: IndexedDBStorageService,
    private cartService: CartService
  ) {
    super(commonService, loghandler);
    this.viewModel = new CartViewModel();
  }

  async ngOnInit() {
    await this.loadCart();
  }

  async loadCart() {
    this.viewModel.cartItems = await this.cartService.getAll();
    console.log(this.viewModel.cartItems);
    console.log(await this.cartService.getAll());

    this.viewModel.subTotal = this.viewModel.cartItems.reduce(
      (sum, item) => sum + (item.price ?? 0) * item.cartQuantity,
      0
    );
    this.viewModel.tax = this.viewModel.subTotal * this.viewModel.taxRate;
    this.viewModel.total = this.viewModel.subTotal + this.viewModel.tax;
  }

  async updateQuantity(item: ProductSM, event: any) {
    const qty = Number(event.target.value) || item.cartQuantity;
    await this.cartService.updateCartItem(item.id, qty);
    await this.loadCart();
  }

  async removeItem(item: ProductSM) {
    await this.cartService.removeById(item.id);
    await this.loadCart();
  }

  async clearCart() {
    await this.cartService.clearCart();
    await this.loadCart();
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
      await this.cartService.updateCartItem(item.id, item.cartQuantity);
    }
    await this.loadCart();
  }
}
