import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppConstants } from '../../app-constants';
import { IndexedDBStorageService } from './indexdb.service';
import { ProductSM } from '../models/service-models/app/v1/product-s-m';
import { BaseService } from './base.service';
import { CommonService } from './common.service';

@Injectable({ providedIn: 'root' })
export class WishlistService extends BaseService {
  private readonly STORAGE_KEY = AppConstants.DbKeys.WISHLIST;

  // in-memory subject + public observable
  private wishlistSubject = new BehaviorSubject<ProductSM[]>([]);
  public wishlist$: Observable<ProductSM[]> =
    this.wishlistSubject.asObservable();

  constructor(
    private commonService: CommonService,
    private indexDB: IndexedDBStorageService
  ) {
    super();
    this.loadInitialWishlist();
  }

  // -------------------------
  // Initialization / helpers
  // -------------------------
  private async loadInitialWishlist(): Promise<void> {
    try {
      const persisted =
        (await this.indexDB.getFromStorage(this.STORAGE_KEY)) || [];
      const normalized: ProductSM[] = Array.isArray(persisted)
        ? persisted.map((p) => this.normalizeProduct(p))
        : [];
      this.wishlistSubject.next(normalized);
    } catch (err) {
      console.error('WishlistService: failed to load initial wishlist', err);
      this.wishlistSubject.next([]);
    }
  }

  private normalizeProduct(p: any): ProductSM {
    return {
      ...p,
      cartQuantity:
        typeof p?.cartQuantity === 'number' && p.cartQuantity > 0
          ? p.cartQuantity
          : 1,
      price: typeof p?.price === 'number' ? p.price : Number(p?.price) || 0,
    } as ProductSM;
  }

  private async persistAndEmit(list: ProductSM[]): Promise<void> {
    try {
      await this.indexDB.saveToStorage(this.STORAGE_KEY, list);
    } catch (err) {
      console.error('WishlistService: failed to persist wishlist', err);
      // continue to emit even if persistence fails so UI stays responsive
    } finally {
      this.wishlistSubject.next(list);
    }
  }

  // -------------------------
  // Public API
  // -------------------------

  /**
   * Toggle wishlist membership for a product.
   * If product is already wishlisted -> remove it. Otherwise add it.
   */
  async toggleWishlist(product: ProductSM): Promise<void> {
    const current = [...(this.wishlistSubject.value || [])];
    const idx = current.findIndex((p) => p.id === product.id);

    if (idx >= 0) {
      // remove
      current.splice(idx, 1);
      this.commonService.ShowToastAtTopEnd(
        'Product removed from wishlist.',
        'success'
      );
    } else {
      const toAdd = this.normalizeProduct(product);
      current.push(toAdd);
      this.commonService.ShowToastAtTopEnd(
        'Product added to wishlist.',
        'success'
      );
    }

    await this.persistAndEmit(current);
  }

  /**
   * Returns true if the product is currently in wishlist (fast check against in-memory subject)
   */
  async isWishlisted(product: ProductSM): Promise<boolean> {
    const current = this.wishlistSubject.value || [];
    return current.some((p) => p.id === product.id);
  }

  /**
   * Return all wishlisted products. Prefers in-memory value, falls back to storage read.
   */
  async getAll(): Promise<ProductSM[]> {
    const current = this.wishlistSubject.value;
    if (current && current.length > 0) {
      return current;
    }
    const persisted =
      (await this.indexDB.getFromStorage(this.STORAGE_KEY)) || [];
    return Array.isArray(persisted)
      ? persisted.map((p) => this.normalizeProduct(p))
      : [];
  }

  /**
   * Remove an item by id. Returns true if removed, false if not found.
   */
  async removeById(id: number): Promise<boolean> {
    const current = [...(this.wishlistSubject.value || [])];
    const exists = current.some((p) => p.id === id);
    if (!exists) return false;

    const filtered = current.filter((p) => p.id !== id);
    await this.persistAndEmit(filtered);
    this.commonService.ShowToastAtTopEnd(
      'Product removed from wishlist.',
      'success'
    );
    return true;
  }

  /**
   * Clear wishlist completely.
   */
  async clearWishlist(): Promise<void> {
    await this.persistAndEmit([]);
    this.commonService.ShowToastAtTopEnd('Wishlist cleared.', 'success');
  }
}
