import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase, DBSchema } from 'idb';
import { ProductSM } from '../models/service-models/app/v1/product-s-m';
import { CartItem } from '../models/view/end-user/cart.viewmodel';

// Service/storage model
export interface WishlistItemStorage {
  id: string;
  product: ProductSM;
  addedAt: string;
}

// UI model
export interface WishlistItem {
  id: string;
  title: string;
  price: number;
  image: string;
  status: 'In Stock' | 'Limited' | 'Out of Stock';
  notes?: string;
  addedAt: string;
  selected?: boolean;
  product: ProductSM;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  createdAt: string;
}

export interface EcommerceDB extends DBSchema {
  cart: { key: string; value: CartItem };
  wishlist: { key: string; value: WishlistItemStorage };
  orders: { key: string; value: Order };
}

@Injectable({
  providedIn: 'root',
})
export class IndexDBStorageService {
  private dbPromise: Promise<IDBPDatabase<EcommerceDB>>;

  constructor() {
    this.dbPromise = openDB<EcommerceDB>('ecommerce-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('cart')) db.createObjectStore('cart');
        if (!db.objectStoreNames.contains('wishlist')) db.createObjectStore('wishlist');
        if (!db.objectStoreNames.contains('orders')) db.createObjectStore('orders');
      },
    });
  }

  // Utility: Map DB WishlistItemStorage to UI WishlistItem
  mapWishlistItemForUI(item: WishlistItemStorage): WishlistItem {
    const stock = typeof item.product.stock === 'number' ? item.product.stock : 0;
    return {
      id: item.id,
      title: item.product.name,
      price: item.product.price,
      image: item.product.images?.[0] || '',
      status: stock > 10
        ? 'In Stock'
        : stock > 0
        ? 'Limited'
        : 'Out of Stock',
      notes: '',
      addedAt: item.addedAt,
      selected: false,
      product: item.product,
    };
  }

  async encrypt(raw: string): Promise<string> {
    return btoa(unescape(encodeURIComponent(raw)));
  }

  async decrypt(enc: string): Promise<string> {
    return decodeURIComponent(escape(atob(enc)));
  }

  async getCart(): Promise<CartItem[]> {
    const db = await this.dbPromise;
    return await db.getAll('cart');
  }
  async toggleWishlist(product: ProductSM): Promise<void> {
    const db = await this.dbPromise;
    const id = product.id.toString();
    const existing = await db.get('wishlist', id);
    if (existing) {
      await db.delete('wishlist', id);
    } else {
      const item: WishlistItemStorage = {
        id,
        product,
        addedAt: new Date().toISOString(),
      };
      await db.put('wishlist', item, id);
    }
  }
  async addToCart(product: ProductSM, quantity: number = 1): Promise<void> {
    const db = await this.dbPromise;
    const existing = await db.get('cart', product.id.toString());
    if (existing) {
      existing.quantity += quantity;
      await db.put('cart', existing, product.id.toString());
    } else {
      const item: CartItem = { id: product.id.toString(), product, quantity };
      await db.put('cart', item, product.id.toString());
    }
  }

  async updateCartItem(id: string, quantity: number): Promise<void> {
    const db = await this.dbPromise;
    const item = await db.get('cart', id);
    if (item) {
      item.quantity = Math.max(1, quantity);
      await db.put('cart', item, id);
    }
  }

  async removeCartItem(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('cart', id);
  }

  async clearCart(): Promise<void> {
    const db = await this.dbPromise;
    await db.clear('cart');
  }

  /* ----------- WISHLIST ----------- */
  async getWishlist(): Promise<WishlistItem[]> {
    const db = await this.dbPromise;
    const rawWishlist: WishlistItemStorage[] = await db.getAll('wishlist');
    return rawWishlist.map(item => this.mapWishlistItemForUI(item));
  }



  async removeFromWishlist(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('wishlist', id);
  }

  /* ----------- ORDERS ----------- */
  async createOrder(cartItems: CartItem[]): Promise<string> {
    const db = await this.dbPromise;
    const orderId = `ORD-${Date.now()}`;
    const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const order: Order = {
      id: orderId,
      items: cartItems,
      total,
      createdAt: new Date().toISOString(),
    };
    await db.put('orders', order, orderId);
    await this.clearCart();
    return orderId;
  }

  async getOrders(): Promise<Order[]> {
    const db = await this.dbPromise;
    return await db.getAll('orders');
  }
}
