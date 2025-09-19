import { Injectable } from '@angular/core';
import { AppConstants } from '../../app-constants';
import { IndexedDBStorageService } from './indexdb.service';
import { ProductSM } from '../models/service-models/app/v1/product-s-m';
import { BaseService } from './base.service';
import { CommonService } from './common.service';

@Injectable({ providedIn: 'root' })
export class WishlistService extends BaseService {
  private readonly STORAGE_KEY = AppConstants.DbKeys.WISHLIST;
  private items: ProductSM[] = [];
  private listeners: Array<(items: ProductSM[]) => void> = [];

  // Promise that resolves when initial load finishes
  private initialized: Promise<void>;

  constructor(
    private commonService: CommonService,
    private indexDB: IndexedDBStorageService
  ) {
    super();
    // start async initialization (do not await in constructor)
    this.initialized = this.loadInitial();
  }

  // ------------- Public API (async) -------------

  // Wait until service is ready (useful for callers)
  async ready(): Promise<void> {
    return this.initialized;
  }

  // Get a snapshot (copy) of current items
  async getAll(): Promise<ProductSM[]> {
    await this.initialized;
    return this.items.slice();
  }

  async getById(id: number): Promise<ProductSM | undefined> {
    await this.initialized;
    return this.items.find((i) => i.id === id);
  }

  async addOrUpdate(item: ProductSM): Promise<ProductSM> {
    await this.initialized;
    const list = this.items;
    if (item.id) {
      const idx = list.findIndex((x) => x.id === item.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...item };
        await this.persist();
        return list[idx];
      }
    }

    list.unshift(item);
    await this.persist();
    return item;
  }

  async removeById(id: number): Promise<ProductSM | null> {
    await this.initialized;
    const idx = this.items.findIndex((x) => x.id === id);
    if (idx === -1) return null;
    const removed = this.items.splice(idx, 1)[0];
    await this.persist();
    return removed;
  }

  async removeByIds(ids: number[]): Promise<ProductSM[]> {
    await this.initialized;
    const removed: ProductSM[] = [];
    this.items = this.items.filter((it) => {
      if (ids.includes(it.id)) {
        removed.push(it);
        return false;
      }
      return true;
    });
    await this.persist();
    return removed;
  }

  async setAll(items: ProductSM[]): Promise<void> {
    await this.initialized;
    this.items = items.map((it) => ({
      ...it,
      id: it.id ?? String(Date.now()) + Math.floor(Math.random() * 10000),
      addedAt: it.addedAt ?? Date.now(),
      selected: !!it.selected,
    }));
    await this.persist();
  }

  async clear(): Promise<void> {
    await this.initialized;
    this.items = [];
    await this.persist();
  }

  async toggleSelect(id: number, selected: boolean): Promise<void> {
    await this.initialized;
    const idx = this.items.findIndex((x) => x.id === id);
    if (idx === -1) return;
    this.items[idx] = { ...this.items[idx], selected };
    await this.persist();
  }

  async updateItem(id: number, partial: Partial<ProductSM>): Promise<void> {
    await this.initialized;
    const idx = this.items.findIndex((x) => x.id === id);
    if (idx === -1) return;
    this.items[idx] = { ...this.items[idx], ...partial };
    await this.persist();
  }

  // Remove and return items (useful to move to cart)
  async moveItemsToCart(ids: number[]): Promise<ProductSM[]> {
    return this.removeByIds(ids);
  }

  // ------------- Simple subscription API (no RxJS) -------------

  /**
   * Register a change listener. Returns an unsubscribe function.
   * Example:
   *   const unsub = wishlistService.onChange(items => this.items = items);
   *   // later: unsub();
   */
  onChange(fn: (items: ProductSM[]) => void): () => void {
    this.listeners.push(fn);
    // call immediately with current snapshot
    try {
      fn(this.items.slice());
    } catch (err) {
      //   console.warn('wishlist onChange listener threw', err);
      this.commonService.showSweetAlert({
        icon: 'error',
        title: 'Error',
        text: 'Failed to emit wishlist to storage',
      });
    }
    return () => this.offChange(fn);
  }

  // Remove listener
  offChange(fn: (items: ProductSM[]) => void): void {
    this.listeners = this.listeners.filter((l) => l !== fn);
  }

  // ------------- Internal helpers -------------

  private emit(): void {
    const snapshot = this.items.slice();
    for (const fn of this.listeners.slice()) {
      try {
        fn(snapshot);
      } catch (err) {
        this.commonService.showSweetAlert({
          icon: 'error',
          title: 'Error',
          text: 'Failed to emit wishlist to storage',
        });
      }
    }
  }

  private async loadInitial(): Promise<void> {
    try {
      this.items = await this.readFromStorage();
    } catch (err) {
      this.commonService.showSweetAlert({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load wishlist from storage',
      });
      this.items = [];
    }
    this.emit();
  }

  private async readFromStorage(): Promise<ProductSM[]> {
    try {
      let raw = await this.indexDB.getFromStorage(this.STORAGE_KEY);

      if (!raw) return [];
      const parsed = raw;
      if (!Array.isArray(parsed)) return [];

      return parsed;
    } catch (err) {
      this.commonService.showSweetAlert({
        icon: 'error',
        title: 'Error',
        text: 'Failed to read wishlist from storage',
      });
      return [];
    }
  }

  private async persist(): Promise<void> {
    try {
      const serialized = JSON.stringify(this.items);
      await this.indexDB.saveToStorage(this.STORAGE_KEY, serialized);
    } catch (err) {
      this.commonService.showSweetAlert({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save wishlist to storage',
      });
    } finally {
      this.emit();
    }
  }
}
