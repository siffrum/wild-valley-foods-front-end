import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
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
import { AddressType } from '../../../../../models/service-models/app/enums/address-type-s-m.enum';
import { CustomerService } from '../../../../../services/customer.service';
import { CustomerDetailSM } from '../../../../../models/service-models/app/v1/customer-detail-s-m';

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
  @ViewChild('customerForm') customerForm!: NgForm;

  couponCode: string = '';

  // Saved customers and selection tracking
  savedCustomers: CustomerDetailSM[] = [];
  selectedCustomerId: number | null = null;
  isFormDisabled: boolean = false;
  currentCard: 'customer' | 'order' = 'customer';

  // derived values
  subTotal: number = 0;
  taxAmount: number = 0;
  shippingAmount: number = 0;

  constructor(
    commonService: CommonService,
    logHandlerService: LogHandlerService,
    private cartService: CartService,
    private storageService: StorageService,
    private customerService: CustomerService,
    private router: Router
  ) {
    super(commonService, logHandlerService);
    this.viewModel = new CheckoutViewModel();
  }

  async ngOnInit(): Promise<void> {
    await this.loadCart();
    await this.loadSavedCustomers();
    this.viewModel.homeAddress.addressType = AddressType.Home;
    this.viewModel.workAddress.addressType = AddressType.Work;
  }

  /**
   * Load saved customers from local storage (max 10)
   */
  async loadSavedCustomers(): Promise<void> {
    try {
      const saved = await this.storageService.getFromStorage(
        AppConstants.DbKeys.SAVED_CUSTOMER_DETAILS
      );
      this.savedCustomers = Array.isArray(saved) ? saved : [];
    } catch (error) {
      console.error('Error loading saved customers', error);
      this.savedCustomers = [];
    }
  }

  /**
   * Select a saved customer and populate the form
   */
  selectCustomer(customerId: number): void {
    const customer = this.savedCustomers.find(
      (c) => c.id === customerId
    );
    if (!customer) return;

    this.selectedCustomerId = customerId;
    this.isFormDisabled = true;

    // Populate form with saved customer details
    this.viewModel.customer = { ...customer };
    if (customer.addresses && customer.addresses.length > 0) {
      this.viewModel.homeAddress = { ...customer.addresses[0] };
    }
    if (customer.addresses && customer.addresses.length > 1) {
      this.viewModel.workAddress = { ...customer.addresses[1] };
    }
  }

  /**
   * Delete a saved customer from storage
   */
  async deleteCustomer(customerId: number, event: Event): Promise<void> {
    event.stopPropagation(); // Prevent triggering select

    this.savedCustomers = this.savedCustomers.filter((c) => c.id !== customerId);
    await this.storageService.saveToStorage(
      AppConstants.DbKeys.SAVED_CUSTOMER_DETAILS,
      this.savedCustomers
    );

    // If deleted customer was selected, clear form
    if (this.selectedCustomerId === customerId) {
      this.clearForm();
    }
  }

  /**
   * Clear form and enable for new entry
   */
  addNewDetails(): void {
    this.clearForm();
  }

  /**
   * Clear all form fields and reset state
   */
  private clearForm(): void {
    this.selectedCustomerId = null;
    this.isFormDisabled = false;
    this.viewModel.customer = new CustomerDetailSM();
    this.viewModel.homeAddress = new (require('../../../../../models/service-models/app/v1/customer-address-detail-s-m').CustomerAddressDetailSM)();
    this.viewModel.workAddress = new (require('../../../../../models/service-models/app/v1/customer-address-detail-s-m').CustomerAddressDetailSM)();
    this.viewModel.homeAddress.addressType = AddressType.Home;
    this.viewModel.workAddress.addressType = AddressType.Work;
    this.viewModel.submitted = false;
  }

  /**
   * Validate required fields before submission
   */
  validateForm(): boolean {
    const customer = this.viewModel.customer;
    const homeAddr = this.viewModel.homeAddress;

    if (
      !customer.firstName ||
      !customer.lastName ||
      !customer.email ||
      !customer.contact
    ) {
      this._commonService.showSweetAlertToast({
        title: 'Validation Error',
        text: 'Please fill all required customer fields.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return false;
    }

    if (!homeAddr.addressLine1 || !homeAddr.city || !homeAddr.state || !homeAddr.country || !homeAddr.postalCode) {
      this._commonService.showSweetAlertToast({
        title: 'Validation Error',
        text: 'Please fill all required address fields (Deliver To section).',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.email)) {
      this._commonService.showSweetAlertToast({
        title: 'Validation Error',
        text: 'Please enter a valid email address.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return false;
    }

    // Validate contact (10 digits)
    if (!/^\d{10}$/.test(customer.contact)) {
      this._commonService.showSweetAlertToast({
        title: 'Validation Error',
        text: 'Contact number must be 10 digits.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return false;
    }

    return true;
  }

  /**
   * Handle form submission (Create new customer or proceed to order)
   */
  async onSubmit(form: any): Promise<void> {
    // If a saved customer is selected, just proceed to order card
    if (this.selectedCustomerId !== null) {
      this.currentCard = 'order';
      return;
    }

    // Otherwise, create new customer
    if (!this.validateForm()) {
      this.viewModel.submitted = true;
      return;
    }

    try {
      this.viewModel.submitted = true;
      this.viewModel.customer.addresses = [
        this.viewModel.homeAddress,
        this.viewModel.workAddress,
      ];

      this._commonService.presentLoading();

      // Call existing create customer API
      const resp = await this.customerService.createCustomer(this.viewModel.customer);

      if (resp.isError) {
        await this._exceptionHandler.logObject(resp.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: resp.errorData.displayMessage,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      } else {
        const createdCustomer = resp.successData;

        // Check 10-customer limit and manage storage
        if (this.savedCustomers.length >= 10) {
          // Remove oldest (first) entry
          this.savedCustomers.shift();
          this._commonService.showSweetAlertToast({
            title: 'Address Limit',
            text: 'Address limit reached — you already have 10 saved addresses. The oldest address was replaced.',
            icon: 'info',
            confirmButtonText: 'OK',
          });
        }

        // Add new customer to storage
        this.savedCustomers.push(createdCustomer);
        await this.storageService.saveToStorage(
          AppConstants.DbKeys.SAVED_CUSTOMER_DETAILS,
          this.savedCustomers
        );

        this._commonService.showSweetAlertToast({
          title: 'Success',
          text: 'Details added successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
        });

        // Proceed to order card
        this.currentCard = 'order';
        this.selectedCustomerId = createdCustomer.id;
      }
    } catch (error) {
      this._exceptionHandler.handleError(error);
    } finally {
      this._commonService.dismissLoader();
    }
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
    await this.cartService.updateCartItem(item.id, item.cartQuantity);
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
    this.shippingAmount =
      this.subTotal >= 1000 || this.subTotal === 0 ? 0 : 50;

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

  canProceed(): boolean {
    return (
      this.viewModel.cartItems &&
      this.viewModel.cartItems.length > 0 &&
      !!this.viewModel.totalPrice
    );
  }

  get submitButtonLabel(): string {
    return this.selectedCustomerId !== null ? 'Next' : 'Create';
  }

  backToCustomer(): void {
    this.currentCard = 'customer';
  }

  async proceedToPayment(): Promise<void> {
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
      customer: this.viewModel.customer,
      addresses: [this.viewModel.homeAddress, this.viewModel.workAddress],
      paymentMethod: this.viewModel.paymentMethod || 'online',
    };

    // navigate with router state
    // this.router.navigate(['/checkout/payment'], { state });
    alert('Not implemented');
  }
}