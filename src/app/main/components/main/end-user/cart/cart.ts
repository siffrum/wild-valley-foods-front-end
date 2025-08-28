import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../../../../base.component';
import { CartItem, CartViewModel } from '../../../../../models/view/end-user/cart.viewmodel';
import { CommonService } from '../../../../../services/common.service';
import { LogHandlerService } from '../../../../../services/log-handler.service';

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
  constructor(commonService: CommonService, loghandler: LogHandlerService) {
    super(commonService, loghandler);
    this.viewModel = new CartViewModel();
  }

  ngOnInit(): void {
    // this.loadCart();
  }

  loadCart() {
    const data = localStorage.getItem('cart');

    this.saveCart(); // Save dummy products to localStorage
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.viewModel.cartItems));
  }

  get subtotal(): number {
    return this.viewModel.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  get tax(): number {
    return this.subtotal * this.viewModel.taxRate;
  }

  get total(): number {
    return this.subtotal + this.tax;
  }

  updateQuantity(item: CartItem, event: Event) {
    const input = event.target as HTMLInputElement;
    let quantity = Number(input.value);
    if (quantity < 1) quantity = 1;
    item.quantity = quantity;
    this.saveCart();
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

  removeItem(item: CartItem) {
    this.viewModel.cartItems = this.viewModel.cartItems.filter((i) => i.id !== item.id);
    this.saveCart();
  }

  clearCart() {
    this.viewModel.cartItems = [];
    this.saveCart();
  }
}
