import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseComponent } from '../../../../../base.component';
import { CheckoutViewModel } from '../../../../../models/view/end-user/checkout.viewmodel';
import { CommonService } from '../../../../../services/common.service';
import { LogHandlerService } from '../../../../../services/log-handler.service';
import { StorageService } from '../../../../../services/storage.service';
import { IndexDBStorageService } from '../../../../../services/indexdb.service';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule,FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout extends BaseComponent<CheckoutViewModel> implements OnInit {
 constructor(
    commonService: CommonService,
    logHandlerService: LogHandlerService,
    private indexDBStorageService:IndexDBStorageService
  ) {
    super(commonService, logHandlerService);
    this.viewModel = new CheckoutViewModel();
  }
  ngOnInit(): void {
    this.loadCart();
  }

  async loadCart(): Promise<void> {
    // // Load cart items from localStorage
    const cart = JSON.parse(await this.indexDBStorageService.getFromStorage('cart') || '[]');
    this.viewModel.cartItems = cart;
    this.calculateTotalPrice();
  }

  calculateTotalPrice(): void {
    this.viewModel.totalPrice = this.viewModel.cartItems.reduce((total, item) => total + item.quantity * item.price, 0);
  }

  async onSubmit(): Promise<void> {
    // Save address to localStorage or proceed to payment
    // localStorage.setItem('shippingAddress', JSON.stringify(this.viewModel.address));
    await this.indexDBStorageService.saveToStorage('shippingAddress', JSON.stringify(this.viewModel.address))
    // Redirect to payment page or show success message
  }

  proceedToPayment(): void {
    // Handle payment processing logic (could be a separate component or integration with a payment gateway)
    alert('Proceeding to payment...');
  }
}
