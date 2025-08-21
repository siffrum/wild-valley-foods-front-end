import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ProductSM {
  id?: number;
  name: string;
  price: number;
  sku: string;
  imageBase64?: string;
}

export interface CartItem {
  product: ProductSM;
  qty: number;
}

@Component({
  selector: 'app-right-offcanvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="offcanvas offcanvas-end"
      tabindex="-1"
      [id]="id"
      [attr.aria-labelledby]="id + 'Label'"
    >
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">Your Cart</h5>
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>

      <div class="offcanvas-body d-flex flex-column p-0">
        <div class="p-3 flex-grow-1 overflow-auto">
          @if (cartItems && cartItems.length > 0) { @for (item of cartItems;
          track item) {
          <div class="d-flex gap-3 mb-3 align-items-start">
            <img
              [src]="item.product.imageBase64 || placeholder"
              alt="{{ item.product.name }}"
              width="80"
              height="80"
              class="rounded"
            />
            <div class="flex-fill">
              <div class="d-flex justify-content-between align-items-start">
                <div class="fw-semibold">{{ item.product.name }}</div>
                <div class="text-end">
                  <div class="fw-bold">
                    {{ currency
                    }}{{ item.product.price * item.qty | number : '1.2-2' }}
                  </div>
                  <small class="text-muted">SKU: {{ item.product.sku }}</small>
                </div>
              </div>

              <div class="d-flex gap-2 align-items-center mt-2">
                <div class="input-group input-group-sm" style="width:110px;">
                  <button
                    class="btn btn-outline-secondary"
                    type="button"
                    (click)="decreaseQty(item)"
                  >
                    −
                  </button>
                  <input
                    type="text"
                    class="form-control text-center"
                    [value]="item.qty"
                    aria-label="Quantity"
                    readonly
                  />
                  <button
                    class="btn btn-outline-secondary"
                    type="button"
                    (click)="increaseQty(item)"
                  >
                    +
                  </button>
                </div>

                <button
                  class="btn btn-sm btn-outline-danger ms-2"
                  (click)="remove.emit(item.product)"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
          } } @else {
          <div class="text-center text-muted my-5">
            <i class="bi bi-cart-x fs-1"></i>
            <div class="mt-2">Your cart is empty</div>
            <small class="text-muted">Add products to see them here</small>
          </div>
          }
        </div>

        <div class="p-3 border-top">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="small text-muted">Subtotal</div>
            <div class="fw-semibold">
              {{ currency }}{{ subtotal | number : '1.2-2' }}
            </div>
          </div>
          <div class="d-flex gap-2">
            <button
              class="btn btn-outline-secondary w-50"
              (click)="viewCart.emit()"
            >
              View Cart
            </button>
            <button
              class="btn btn-primary w-50"
              [disabled]="cartItems.length === 0"
              (click)="checkout.emit()"
            >
              Checkout
            </button>
          </div>
          <div class="small text-muted mt-2">
            Shipping & taxes calculated at checkout
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .offcanvas-body .overflow-auto {
        max-height: calc(100vh - 260px);
      }
    `,
  ],
})
export class RightOffcanvasComponent {
  @Input() id = 'offcanvasRight';
  @Input() cartItems: CartItem[] = [];
  @Input() currency = '₹';
  @Input() placeholder = 'assets/placeholder.png';

  @Output() remove = new EventEmitter<ProductSM>();
  @Output() viewCart = new EventEmitter<void>();
  @Output() checkout = new EventEmitter<void>();
  @Output() qtyChange = new EventEmitter<CartItem>();

  get subtotal() {
    return this.cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);
  }

  increaseQty(item: CartItem) {
    item.qty = item.qty + 1;
    this.qtyChange.emit(item);
  }
  decreaseQty(item: CartItem) {
    if (item.qty <= 1) return;
    item.qty = item.qty - 1;
    this.qtyChange.emit(item);
  }
}
