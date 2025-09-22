import { CommonModule, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../../../services/cart.service';
import { ProductSM } from '../../../../../models/service-models/app/v1/product-s-m';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class Header implements OnInit {
  constructor(private cartService: CartService) {}
  isLoggedIn: boolean = false;
  categories = [
    {
      name: 'Dry Fruits',
      icon: 'bi bi-nut',
      items: ['Almonds', 'Cashews', 'Walnuts', 'Pistachios'],
    },
    {
      name: 'Seeds',
      icon: 'bi bi-droplet',
      items: ['Chia Seeds', 'Flax Seeds', 'Pumpkin Seeds'],
    },
    {
      name: 'Beverages',
      icon: 'bi bi-cup-straw',
      items: ['Herbal Tea', 'Green Tea', 'Fruit Juices'],
    },
    {
      name: 'Gift Packs',
      icon: 'bi bi-gift',
      items: ['Festive Hampers', 'Corporate Packs'],
    },
  ];
  cartItems: ProductSM[] = [];
  subTotal = 0;
  private sub: Subscription | null = null;
  ngOnInit(): void {
    this.sub = this.cartService.cart$.subscribe((items) => {
      this.cartItems = items || [];
      // optionally compute subtotal live here
      this.subTotal = this.cartItems.reduce(
        (sum, item) => sum + (item.price ?? 0) * item.cartQuantity,
        0
      );
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
  // Compute total price
  async cartTotal() {
    return await this.cartService.cartTotal();
  }
  async getCartItems() {
    this.cartItems = await this.cartService.getAll();
    console.log(this.cartItems);
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
    for (const item of this.cartItems) {
      await this.cartService.updateCartItem(item.id, item.cartQuantity);
    }
    await this.getCartItems();
  }

  removeItem(item: ProductSM) {
    this.cartService.removeById(item.id);
    this.getCartItems();
  }
}
