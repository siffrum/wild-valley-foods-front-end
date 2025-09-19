import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../../../../base.component';
import {
  CartItem,
  CartViewModel,
} from '../../../../../models/view/end-user/cart.viewmodel';
import { CommonService } from '../../../../../services/common.service';
import { LogHandlerService } from '../../../../../services/log-handler.service';
import { IndexedDBStorageService } from '../../../../../services/indexdb.service';

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
    private IndexDbStorageService: IndexedDBStorageService
  ) {
    super(commonService, loghandler);
    this.viewModel = new CartViewModel();
  }
  cartItems: CartItem[] = [];
  total: number = 0;
  subtotal: number = 0;
  tax: number = 0;
  async ngOnInit() {
    await this.loadCart();
  }

  async loadCart() {
    // const rawCart = await this.IndexDbStorageService.getCart();
    // Map CartItem to ensure UI fields present
    // this.viewModel.cartItems = rawCart.map(item => ({
    //   ...item,
    //   name: item.product.name,
    //   price: item.product.price,
    //   image: item.product.images?.[0] || ''
    // }));
    // this.subtotal = this.viewModel.cartItems.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);
    // this.tax = this.subtotal * this.viewModel.taxRate;
    // this.total = this.subtotal + this.tax;
  }

  async updateQuantity(item: CartItem, event: any) {
    // const qty = Number(event.target.value) || item.quantity;
    // await this.IndexDbStorageService.updateCartItem(item.id, qty);
    // await this.loadCart();
  }

  async removeItem(item: CartItem) {
    // await this.IndexDbStorageService.removeCartItem(item.id);
    // await this.loadCart();
  }

  async clearCart() {
    // await this.IndexDbStorageService.clearCart();
    // await this.loadCart();
  }

  increment(item: CartItem) {
    item.quantity++;
    this.saveCart();
  }

  decrement(item: CartItem) {
    if (item.quantity > 1) {
      item.quantity--;
      this.saveCart();
    }
  }

  async saveCart() {
    // for (const item of this.viewModel.cartItems) {
    //   await this.IndexDbStorageService.updateCartItem(item.id, item.quantity);
    // }
    // await this.loadCart();
  }
}
