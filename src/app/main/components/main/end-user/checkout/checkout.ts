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
import { CustomerAddressDetailSM } from '../../../../../models/service-models/app/v1/customer-address-detail-s-m';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ProductUtils } from '../../../../../utils/product.utils';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss'],
})
export class Checkout
  extends BaseComponent<CheckoutViewModel>
  implements OnInit
{
  @ViewChild('customerForm') customerForm!: NgForm;

  // Expose ProductUtils to template
  utils = ProductUtils;

  savedCustomers: CustomerDetailSM[] = [];
  selectedCustomerId: number | null = null;
  isFormDisabled = false;
  currentCard: 'customer' | 'order' = 'customer';

  subTotal = 0;
  taxAmount = 0;
  shippingAmount = 0;
  couponCode = '';
  selectedAddressType: AddressType = AddressType.Home;

  constructor(
    commonService: CommonService,
    logHandlerService: LogHandlerService,
    private cartService: CartService,
    private storageService: StorageService,
    private customerService: CustomerService,
    private router: Router,
    private http: HttpClient
  ) {
    super(commonService, logHandlerService);
    this.viewModel = new CheckoutViewModel();
  }

  async ngOnInit() {
    await this.loadSavedCustomers();
    await this.loadCart();
    this.selectedAddressType = AddressType.Home;
    this.viewModel.homeAddress.addressType = AddressType.Home;
  }

  async loadSavedCustomers() {
    try {
      const saved: CustomerDetailSM[] =
        (await this.storageService.getFromStorage(
          AppConstants.DbKeys.SAVED_CUSTOMER_DETAILS
        )) || [];
      this.savedCustomers = saved.slice(0, 10);
    } catch (error) {
      this.savedCustomers = [];
    }
  }

  selectCustomer(event: any) {
    if (event.target.value == null) return;
    let customerId = Number(event.target.value);
    if (!customerId) return;
    const id = Number(customerId);
    const customer = this.savedCustomers.find((c) => c.id === id);
    if (!customer) return;

    this.selectedCustomerId = id;
    this.isFormDisabled = true;
    this.viewModel.customer = { ...customer };
    this.viewModel.createdCustomer = { ...customer };

    const homeAddr = customer.addresses?.find(
      (a) => a.addressType === AddressType.Home
    );
    if (homeAddr) this.viewModel.homeAddress = { ...homeAddr };
  }

  async deleteCustomer(customerId: number, event: Event) {
    event.stopPropagation();
    this.savedCustomers = this.savedCustomers.filter(
      (c) => c.id !== customerId
    );
    await this.storageService.saveToStorage(
      AppConstants.DbKeys.SAVED_CUSTOMER_DETAILS,
      this.savedCustomers
    );
    if (this.selectedCustomerId === customerId) this.clearForm();
  }

  addNewDetails() {
    this.clearForm();
  }

  clearForm() {
    this.selectedCustomerId = null;
    this.isFormDisabled = false;
    this.viewModel.customer = new CustomerDetailSM();
    this.viewModel.homeAddress = new CustomerAddressDetailSM();
    this.selectedAddressType = AddressType.Home;
    this.viewModel.submitted = false;
  }

  validateForm(): boolean {
    const { firstName, lastName, email, contact } = this.viewModel.customer;
    const a = this.viewModel.homeAddress;
    if (!firstName || !lastName || !email || !contact) {
      this._commonService.showSweetAlertToast({
        title: 'Validation Error',
        text: 'Please fill all required customer fields.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this._commonService.showSweetAlertToast({
        title: 'Validation Error',
        text: 'Please enter a valid email address.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return false;
    }
    if (!/^\d{10}$/.test(contact)) {
      this._commonService.showSweetAlertToast({
        title: 'Validation Error',
        text: 'Contact number must be 10 digits.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return false;
    }
    if (!a.addressLine1 || !a.city || !a.state || !a.country || !a.postalCode) {
      this._commonService.showSweetAlertToast({
        title: 'Validation Error',
        text: 'Please fill all required address fields.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return false;
    }
    return true;
  }

  async onSubmit() {
    if (this.selectedCustomerId !== null) {
      this.currentCard = 'order';
      return;
    }
    try {
      this.viewModel.submitted = true;
      this.viewModel.homeAddress.addressType = this.selectedAddressType;
      this.viewModel.customer.addresses = [this.viewModel.homeAddress];
      this._commonService.presentLoading();
      const resp = await this.customerService.createCustomer(
        this.viewModel.customer
      );
      if (resp.isError) {
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: resp.errorData.displayMessage,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      } else {
        this.viewModel.createdCustomer = resp.successData;
        if (this.savedCustomers.length >= 10) {
          this.savedCustomers.shift();
          this._commonService.showSweetAlertToast({
            title: 'Address Limit',
            text: 'Address limit reached. Oldest address was replaced.',
            icon: 'info',
            confirmButtonText: 'OK',
          });
        } else {
          await this.savedCustomers.push(this.viewModel.createdCustomer);
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
          this.currentCard = 'order';
          this.selectedCustomerId = this.viewModel.createdCustomer.id;
        }
      }
    } catch (error) {
      this._exceptionHandler.handleError(error);
    } finally {
      this._commonService.dismissLoader();
    }
  }

  async loadCart() {
    try {
      this.viewModel.cartItems = (await this.cartService.getAll()) || [];
    } catch {
      this.viewModel.cartItems = [];
    }
    
    // Initialize selected variant for each cart item
    this.viewModel.cartItems.forEach((item: ProductSM) => {
      if (!item.cartQuantity || item.cartQuantity < 1) item.cartQuantity = 1;
      ProductUtils.initializeSelectedVariant(item);
    });
    
    this.recalculate();
  }

  imageOf(item: ProductSM): string {
    return item && item.images && item.images.length
      ? item.images[0]
      : 'data:image/svg+xml;utf8,' +
          encodeURIComponent(
            '<svg width="120" height="120"><rect width="100%" height="100%" fill="#eee"/><text x="50%" y="50%" font-size="12" dominant-baseline="middle" text-anchor="middle" fill="#aaa">No image</text></svg>'
          );
  }

  /**
   * Get variant for display using ProductUtils
   */
  getSelectedVariant(item: ProductSM): any {
    return ProductUtils.getSelectedVariant(item);
  }

  /**
   * Get price for item using ProductUtils
   */
  getItemPrice(item: ProductSM): number {
    return ProductUtils.getPrice(item);
  }

  /**
   * Get SKU for item using ProductUtils
   */
  getItemSku(item: ProductSM): string {
    return ProductUtils.getSku(item);
  }

  /**
   * Get unit display for item
   */
  getItemUnitDisplay(item: ProductSM): string {
    const variant = ProductUtils.getSelectedVariant(item);
    if (!variant) return '';
    return `${variant.quantity}${variant.unitSymbol || variant.unitName || ''}`;
  }

  /**
   * Calculate item total
   */
  getItemTotal(item: ProductSM): number {
    return ProductUtils.getPrice(item) * (item.cartQuantity || 1);
  }

  /**
   * Update cart item quantity
   */
  async updateCart(item: ProductSM) {
    item.cartQuantity = Number(item.cartQuantity) || 1;
    await this.cartService.updateCartItem(item.id, item.cartQuantity, item.selectedVariantId);
    this.recalculate();
  }

  /**
   * Remove item from cart
   */
  async removeItem(item: ProductSM) {
    await this.cartService.removeById(item.id, item.selectedVariantId);
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

  /**
   * Recalculate totals using ProductUtils for variant prices
   */
  recalculate() {
    const items = this.viewModel.cartItems || [];
    
    // Calculate subtotal using variant prices
    this.subTotal = items.reduce((acc, item) => {
      const price = ProductUtils.getPrice(item);
      return acc + price * (item.cartQuantity || 1);
    }, 0);
    
    // Calculate tax using variant prices
    this.taxAmount = items.reduce((acc, item) => {
      const price = ProductUtils.getPrice(item);
      const taxRate = item.taxRate || 0;
      return acc + (price * (item.cartQuantity || 1) * taxRate) / 100;
    }, 0);
    
    // Free shipping over ₹1000
    this.shippingAmount = this.subTotal >= 1000 || this.subTotal === 0 ? 0 : 50;

    // Apply coupon discount
    const couponDiscount = this.calculateCouponDiscount(this.subTotal);
    const total = this.subTotal + this.taxAmount + this.shippingAmount - couponDiscount;
    this.viewModel.totalPrice = Math.max(0, Number(total.toFixed(2)));
  }

  calculateCouponDiscount(subtotal: number): number {
    const code = (this.couponCode || '').trim().toUpperCase();
    if (!code) return 0;
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
      this.viewModel.cartItems?.length > 0 && this.viewModel.totalPrice > 0
    );
  }

  get submitButtonLabel(): string {
    return this.selectedCustomerId !== null ? 'Next' : 'Create';
  }

  backToCustomer() {
    this.currentCard = 'customer';
  }

  /**
   * Proceed to payment
   * Creates order with variant-specific data:
   * - productId
   * - variantId (productVariantId)
   * - variantPrice
   * - unitSymbol
   * - quantity
   * - sku
   */
  async proceedToPayment() {
    if (!this.canProceed()) {
      this._commonService.ShowToastAtTopEnd(
        'Cart empty. Add items before proceeding.',
        'error'
      );
      return;
    }
    this.recalculate();

    // Validate all items have selected variants
    for (const item of this.viewModel.cartItems) {
      const variant = ProductUtils.getSelectedVariant(item);
      if (!variant) {
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: `Product "${item.name}" does not have a selected variant. Please refresh and try again.`,
          icon: 'error',
          confirmButtonText: 'OK',
        });
        return;
      }
    }

    // Build order items with full variant information
    const orderItems = this.viewModel.cartItems.map((item) => {
      const variant = ProductUtils.getSelectedVariant(item);
      return {
        productId: item.id,
        productVariantId: variant.id,
        variantPrice: variant.price,
        unitSymbol: variant.unitSymbol || variant.unitName || '',
        quantity: item.cartQuantity || 1,
        sku: variant.sku || '',
      };
    });

    const payload = {
      customerId: this.viewModel.createdCustomer.id,
      items: orderItems,
      subtotal: this.subTotal,
      taxAmount: this.taxAmount,
      shippingAmount: this.shippingAmount,
      totalAmount: this.viewModel.totalPrice,
      couponCode: this.couponCode || null,
    };
    
    console.log('[Checkout] Order payload:', payload);

    try {
      this._commonService.presentLoading();
      
      // Create Backend Order
      let resp = await this.customerService.proccedToOrder(payload);
      
      if (resp.isError) {
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: resp.errorData.displayMessage,
          icon: 'error',
          confirmButtonText: 'OK',
        });
        return;
      }
      
      const createRes = resp.successData;
      if (!createRes) {
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: 'Failed to create order. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
        return;
      }

      // Open Razorpay payment link
      if (createRes.paymentLink?.short_url) {
        window.open(createRes.paymentLink.short_url, '_blank');
        
        // Clear cart after successful order creation
        await this.cartService.clearCart();
        this.viewModel.cartItems = [];
        
        this._commonService.showSweetAlertToast({
          title: 'Order Created',
          text: 'Please complete payment in the new window.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
      }
    } catch (err: any) {
      console.error('[Checkout] Order error:', err);
      this._commonService.showSweetAlertToast({
        title: 'Order Error',
        text: err.message || 'Order failed! Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } finally {
      this._commonService.dismissLoader();
    }
  }

  verifyPayment(order: any) {
    const { razorpayOrderId, paymentId, signature } = order;
    let payload = { razorpayOrderId, paymentId, signature };
    console.log('[Checkout] Verifying payment:', payload);
    let resp = this.customerService.verifyPayment(payload);
  }
}
