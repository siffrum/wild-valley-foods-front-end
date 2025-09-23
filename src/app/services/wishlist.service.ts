import { Injectable } from '@angular/core';
import { AppConstants } from '../../app-constants';
import { IndexedDBStorageService } from './indexdb.service';
import { ProductSM } from '../models/service-models/app/v1/product-s-m';
import { BaseService } from './base.service';
import { CommonService } from './common.service';

@Injectable({ providedIn: 'root' })
export class WishlistService extends BaseService {
  private readonly STORAGE_KEY = AppConstants.DbKeys.WISHLIST;

  constructor(
    private commonService: CommonService,
    private indexDB: IndexedDBStorageService
  ) {
    super();
  }

  async toggleWishlist(product: ProductSM) {
    let wishListedProducts =
      (await this.indexDB.getFromStorage(this.STORAGE_KEY)) || [];
    const exists: boolean = wishListedProducts.find(
      (p: ProductSM) => p.id === product.id
    );

    if (exists) {
      console.log(exists);

      wishListedProducts = wishListedProducts.filter(
        (p: ProductSM) => p.id !== product.id
      );
      this.commonService.ShowToastAtTopEnd(
        'Product removed from wishlist.',
        'success'
      );
    } else {
      wishListedProducts.push(product);
      this.commonService.ShowToastAtTopEnd(
        'Product added to wishlist.',
        'success'
      );
    }
    await this.indexDB.saveToStorage(this.STORAGE_KEY, wishListedProducts);
  }

  async isWishlisted(product: ProductSM) {
    const wishListedProducts = await this.indexDB.getFromStorage(
      this.STORAGE_KEY
    );
    const exists: boolean = wishListedProducts.find(
      (p: ProductSM) => p.id === product.id
    );
    return exists;
  }

  async getAll() {
    return await this.indexDB.getFromStorage(this.STORAGE_KEY);
  }

  async removeById(id: number) {
    const wishListedProducts = await this.indexDB.getFromStorage(
      this.STORAGE_KEY
    );
    const exists: boolean = wishListedProducts.find(
      (p: ProductSM) => p.id === id
    );
    if (!exists) return false;
    await this.indexDB.saveToStorage(
      this.STORAGE_KEY,
      wishListedProducts.filter((p: ProductSM) => p.id !== id)
    );
    this.commonService.ShowToastAtTopEnd(
      'Product removed from wishlist.',
      'success'
    );
    return true;
  }
}
