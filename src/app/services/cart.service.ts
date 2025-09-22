import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppConstants } from '../../app-constants';
import { IndexedDBStorageService } from './indexdb.service';
import { ProductSM } from '../models/service-models/app/v1/product-s-m';
import { BaseService } from './base.service';
import { CommonService } from './common.service';

@Injectable({ providedIn: 'root' })
export class CartService extends BaseService {
  private readonly STORAGE_KEY = AppConstants.DbKeys.CART;

  // BehaviorSubject holds the current cart array. Start with empty array;
  // will be replaced by persisted value once loaded.
  private cartSubject = new BehaviorSubject<ProductSM[]>([]);
  public cart$: Observable<ProductSM[]> = this.cartSubject.asObservable();

  constructor(
    private commonService: CommonService,
    private indexDB: IndexedDBStorageService
  ) {
    super();
    this.loadInitialCart(); // hydrate from IndexedDB on startup
  }

  // -------------------------
  // Initialization / helpers
  // -------------------------
  private async loadInitialCart(): Promise<void> {
    try {
      const persisted =
        (await this.indexDB.getFromStorage(this.STORAGE_KEY)) || [];
      // Ensure array and normalize items
      const normalized: ProductSM[] = Array.isArray(persisted)
        ? persisted.map((p) => this.normalizeProduct(p))
        : [];
      this.cartSubject.next(normalized);
    } catch (err) {
      console.error('CartService: failed to load initial cart', err);
      this.cartSubject.next([]);
    }
  }

  private normalizeProduct(p: any): ProductSM {
    // Ensure required fields exist and types are sane.
    // Adjust this to fit your ProductSM shape.
    return {
      ...p,
      cartQuantity:
        typeof p?.cartQuantity === 'number' && p.cartQuantity > 0
          ? p.cartQuantity
          : 1,
      price: typeof p?.price === 'number' ? p.price : Number(p?.price) || 0,
    } as ProductSM;
  }

  private async persistAndEmit(cart: ProductSM[]): Promise<void> {
    try {
      await this.indexDB.saveToStorage(this.STORAGE_KEY, cart);
    } catch (err) {
      console.error('CartService: failed to persist cart', err);
      // still emit so UI updates optimistically
    } finally {
      this.cartSubject.next(cart);
    }
  }

  // -------------------------
  // Public API (async same as before)
  // -------------------------
  async toggleCart(product: ProductSM): Promise<void> {
    const current = [...(this.cartSubject.value || [])];
    const idx = current.findIndex((p) => p.id === product.id);

    if (idx >= 0) {
      alert('Product is already in cart.');
    } else {
      // add (normalize)
      const toAdd = this.normalizeProduct(product);
      current.push(toAdd);
    }

    await this.persistAndEmit(current);
  }

  async isCarted(product: ProductSM): Promise<boolean> {
    const current = this.cartSubject.value || [];
    return current.some((p) => p.id === product.id);
  }

  // returns the current cart (prefers in-memory subject value)
  async getAll(): Promise<ProductSM[]> {
    // if subject has been hydrated, return it; fallback to storage read.
    const current = this.cartSubject.value;
    if (current && current.length > 0) {
      return current;
    }
    const persisted =
      (await this.indexDB.getFromStorage(this.STORAGE_KEY)) || [];
    return Array.isArray(persisted)
      ? persisted.map((p) => this.normalizeProduct(p))
      : [];
  }

  async updateCartItem(id: number, quantity: number): Promise<void> {
    const current = [...(this.cartSubject.value || [])];
    const idx = current.findIndex((p) => p.id === id);

    if (idx === -1) return; // nothing to update

    if (quantity <= 0) {
      // remove item if quantity <= 0
      current.splice(idx, 1);
    } else {
      current[idx].cartQuantity = quantity;
    }

    await this.persistAndEmit(current);
  }

  async removeById(id: number): Promise<boolean> {
    const current = [...(this.cartSubject.value || [])];
    const exists = current.some((p) => p.id === id);
    if (!exists) return false;

    const filtered = current.filter((p) => p.id !== id);
    await this.persistAndEmit(filtered);
    return true;
  }

  async clearCart(): Promise<void> {
    await this.persistAndEmit([]);
  }

  async cartTotal(): Promise<number> {
    const current = this.cartSubject.value || [];
    let total = 0;
    current.forEach((p) => {
      const qty =
        typeof p.cartQuantity === 'number'
          ? p.cartQuantity
          : Number(p.cartQuantity) || 0;
      const price =
        typeof p.price === 'number' ? p.price : Number(p.price) || 0;
      total += qty * price;
    });
    return total;
  }
}
