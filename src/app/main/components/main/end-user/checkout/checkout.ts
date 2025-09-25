import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseComponent } from '../../../../../base.component';
import { CheckoutViewModel } from '../../../../../models/view/end-user/checkout.viewmodel';
import { LogHandlerService } from '../../../../../services/log-handler.service';
import { CartService } from '../../../../../services/cart.service';
import { StorageService } from '../../../../../services/storage.service';
import { ProductSM } from '../../../../../models/service-models/app/v1/product-s-m';
import { CommonService } from '../../../../../services/common.service';
import { AppConstants } from '../../../../../../app-constants';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss'],
})
export class Checkout
  extends BaseComponent<CheckoutViewModel>
  implements OnInit
{
  couponCode: string = '';

  // derived values
  subTotal: number = 0;
  taxAmount: number = 0;
  shippingAmount: number = 0;

  constructor(
    commonService: CommonService,
    logHandlerService: LogHandlerService,
    private cartService: CartService,
    private storageService: StorageService,
    private router: Router
  ) {
    super(commonService, logHandlerService);
    this.viewModel = new CheckoutViewModel();
  }

  async ngOnInit(): Promise<void> {
    await this.loadCart();
    await this.loadSavedAddress();
  }

  async loadCart(): Promise<void> {
    try {
      this.viewModel.cartItems = (await this.cartService.getAll()) || [];
    } catch (err) {
      console.error('Error loading cart', err);
      this.viewModel.cartItems = [];
    }
    // ensure cartQuantity field exists on each item
    this.viewModel.cartItems.forEach((it: ProductSM) => {
      if (
        it.cartQuantity === undefined ||
        it.cartQuantity === null ||
        it.cartQuantity === 0
      )
        it.cartQuantity = 1;
    });
    this.recalculate();
  }

  // helper to display image (use base64 if provided)
  imageOf(item: ProductSM): string {
    if (item && item.images && item.images.length) return item.images[0];
    // fallback placeholder data-uri (small SVG)
    return (
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="100%" height="100%" fill="#eee"/><text x="50%" y="50%" font-size="12" dominant-baseline="middle" text-anchor="middle" fill="#aaa">No image</text></svg>`
      )
    );
  }

  increaseQty(item: ProductSM) {
    item.cartQuantity = (item.cartQuantity || 0) + 1;
    this.updateCart(item);
  }

  decreaseQty(item: ProductSM) {
    item.cartQuantity = Math.max(1, (item.cartQuantity || 1) - 1);
    this.updateCart(item);
  }

  async updateCart(item: ProductSM) {
    // ensure number
    item.cartQuantity = Number(item.cartQuantity) || 1;
    await this.cartService.updateCartItem(item.id, item.cartQuantity); // assumes your CartService implements updateItem
    this.recalculate();
  }

  async removeItem(item: ProductSM) {
    await this.cartService.removeById(item.id);
    // update local list
    this.viewModel.cartItems = this.viewModel.cartItems.filter(
      (x) => x !== item
    );
    this.recalculate();
  }

  async clearCart() {
    await this.cartService.clearCart();
    this.viewModel.cartItems = [];
    this.recalculate();
  }

  recalculate() {
    // Subtotal = sum(item.price * qty)
    this.subTotal = this.viewModel.cartItems.reduce((acc, it) => {
      const price = Number(it.price || 0);
      const qty = Number(it.cartQuantity || 0);
      return acc + price * qty;
    }, 0);

    // Tax: sum(item.price * qty * (taxRate || 0)/100)
    this.taxAmount = this.viewModel.cartItems.reduce((acc, it) => {
      const taxRate = Number(it.taxRate || 0);
      return (
        acc +
        (Number(it.price || 0) * Number(it.cartQuantity || 0) * taxRate) / 100
      );
    }, 0);

    // Shipping: simple flat rule (can be replaced with real calc)
    this.shippingAmount = this.subTotal >= 1000 || this.subTotal === 0 ? 0 : 50;

    // Apply coupon (simple)
    const couponDiscount = this.calculateCouponDiscount(this.subTotal);

    // update totals
    const total =
      this.subTotal + this.taxAmount + this.shippingAmount - couponDiscount;
    this.viewModel.totalPrice = Math.max(0, Number(Number(total).toFixed(2)));
  }

  calculateCouponDiscount(subtotal: number): number {
    if (!this.couponCode) return 0;
    const code = (this.couponCode || '').trim().toUpperCase();
    if (code === 'SAVE50') return Math.min(50, subtotal);
    if (code === 'PCT10') return +(subtotal * 0.1).toFixed(2);
    return 0;
  }

  applyCoupon() {
    this.recalculate();
  }

  get shippingLabel(): string {
    return this.shippingAmount === 0
      ? 'Free'
      : `₹${this.shippingAmount.toFixed(2)}`;
  }

  async onSubmit(form?: NgForm) {
    // store address in storage (persist for quick load later)
    const addr = this.viewModel.address || {};
    if (
      !addr.fullName ||
      !addr.addressLine ||
      !addr.city ||
      !addr.postalCode ||
      !addr.country
    ) {
      // basic guard, don't save incomplete
      this._commonService.ShowToastAtTopEnd(
        'Please complete the address before saving.',
        'error'
      );
      return;
    }
    try {
      await this.storageService.saveToStorage(
        AppConstants.DbKeys.SAVED_ADDRESS,
        addr
      );
      this._commonService.ShowToastAtTopEnd(
        'Address saved locally.',
        'success'
      );
    } catch (err) {
      this._commonService.ShowToastAtTopEnd('Error saving address.', 'error');
    }
  }

  async loadSavedAddress() {
    const saved = await this.storageService.getFromStorage(
      AppConstants.DbKeys.SAVED_ADDRESS
    );
    if (saved) {
      this.viewModel.address = { ...this.viewModel.address, ...saved };
      return;
    }
  }

  async clearAddress() {
    this.viewModel.address = {};

    await this.storageService.removeFromStorage(
      AppConstants.DbKeys.SAVED_ADDRESS
    );
  }

  canProceed(): boolean {
    return (
      this.viewModel.cartItems &&
      this.viewModel.cartItems.length > 0 &&
      !!this.viewModel.totalPrice
    );
  }

  async proceedToPayment() {
    if (!this.canProceed()) {
      this._commonService.ShowToastAtTopEnd(
        'Cart empty. Add items before proceeding.',
        'error'
      );
      return;
    }

    // ensure recalculated
    this.recalculate();

    // Prepare state to send to payment page
    const state = {
      items: this.viewModel.cartItems.map((i) => ({
        product: i,
        qty: i.cartQuantity,
      })),
      totals: {
        subTotal: this.subTotal,
        tax: this.taxAmount,
        shipping: this.shippingAmount,
        grandTotal: this.viewModel.totalPrice,
        coupon: this.couponCode,
      },
      address: this.viewModel.address,
      paymentMethod: this.viewModel.paymentMethod || 'online',
    };

    // navigate with router state
    // this.router.navigate(['/checkout/payment'], { state });
    alert('Not implemented');
  }
}
