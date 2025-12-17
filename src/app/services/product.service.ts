import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { ProductClient } from '../clients/product.client';
import { QueryFilter } from '../models/service-models/foundation/api-contracts/query-filter';
import { ApiResponse } from '../models/service-models/foundation/api-contracts/base/api-response';
import { IntResponseRoot } from '../models/service-models/foundation/common-response/int-response-root';
import { DeleteResponseRoot } from '../models/service-models/foundation/common-response/delete-response-root';
import { AdminProductsViewModel } from '../models/view/Admin/admin-product.viewmodel';
import { ProductSM } from '../models/service-models/app/v1/product-s-m';
import { UserProductViewModel } from '../models/view/end-user/product/user-product.viewmodel';
import { ReviewSM } from '../models/service-models/app/v1/review-s-m';
import { AppConstants } from '../../app-constants';
import { BoolResponseRoot } from '../models/service-models/foundation/common-response/bool-response-root';
import { ApiRequest } from '../models/service-models/foundation/api-contracts/base/api-request';

@Injectable({
  providedIn: 'root',
})
export class ProductService extends BaseService {
  constructor(private productClient: ProductClient) {
    super();
  }

  async getAllProducts(
    viewModel: AdminProductsViewModel
  ): Promise<ApiResponse<ProductSM[]>> {
    const queryFilter = new QueryFilter();
    queryFilter.skip =
      (viewModel.pagination.PageNo - 1) * viewModel.pagination.PageSize;
    queryFilter.top = viewModel.pagination.PageSize;
    const response = await this.productClient.GetAllProduct(queryFilter);
    if (!response.isError && response.successData) {
      response.successData = response.successData.map(p => this.normalizeProductData(p));
    }
    return response;
  }

  async getAllProductsBySearchString(
    searchString: string
  ): Promise<ApiResponse<ProductSM[]>> {
    const response = await this.productClient.GetAllProductsBySearhString(searchString);
    if (!response.isError && response.successData) {
      response.successData = response.successData.map(p => this.normalizeProductData(p));
    }
    return response;
  }
  async getTotatProductCount(): Promise<ApiResponse<IntResponseRoot>> {
    return await this.productClient.GetTotatProductCount();
  }

  async getAllProductsByCategoryId(
    viewModel: UserProductViewModel
  ): Promise<ApiResponse<ProductSM[]>> {
    const queryFilter = new QueryFilter();
    queryFilter.skip =
      (viewModel.pagination.PageNo - 1) * viewModel.pagination.PageSize;
    queryFilter.top = viewModel.pagination.PageSize;
    let categoryId = viewModel.categoryId;
    const response = await this.productClient.GetAllProductsByCategoryId(
      queryFilter,
      categoryId
    );
    if (!response.isError && response.successData) {
      response.successData = response.successData.map(p => this.normalizeProductData(p));
    }
    return response;
  }
  async getTotatProductCountByCategoryId(
    categoryId: number
  ): Promise<ApiResponse<IntResponseRoot>> {
    return await this.productClient.GetTotatProductCountByCategoryId(
      categoryId
    );
  }
  async deleteProduct(id: number): Promise<ApiResponse<DeleteResponseRoot>> {
    if (id <= 0) {
      throw new Error('Invalid id for delete');
    }
    return await this.productClient.DeleteProductById(id);
  }

  /**
   * Normalize variant data from API response
   * REFACTOR: Ensure unitId, unitName, unitSymbol are populated from unitValue relation
   */
  private normalizeVariantData(variant: any): any {
    if (!variant) return variant;
    
    // If unitValue relation exists but unitId/unitName/unitSymbol are missing, populate them
    if (variant.unitValue && !variant.unitId) {
      variant.unitId = variant.unitValueId;
      variant.unitName = variant.unitValue.name || '';
      variant.unitSymbol = variant.unitValue.symbol || variant.unitValue.name || '';
    }
    
    return variant;
  }

  /**
   * Normalize product data from API response
   * REFACTOR: Ensure all variants have unitId, unitName, unitSymbol
   */
  private normalizeProductData(product: any): ProductSM {
    if (!product) return product;
    
    // Normalize all variants
    if (product.variants && Array.isArray(product.variants)) {
      product.variants = product.variants.map((v: any) => this.normalizeVariantData(v));
    }
    
    // Initialize selectedVariantId if not set
    if (!product.selectedVariantId && product.variants && product.variants.length > 0) {
      const defaultVariant = product.variants.find((v: any) => v.isDefaultVariant) || product.variants[0];
      if (defaultVariant) {
        product.selectedVariantId = defaultVariant.id;
      }
    }
    
    return product as ProductSM;
  }

  async getProductById(id: number): Promise<ApiResponse<ProductSM>> {
    if (id <= 0) {
      throw new Error('Invalid id for getProductById');
    }
    const response = await this.productClient.GetProductById(id);
    if (!response.isError && response.successData) {
      response.successData = this.normalizeProductData(response.successData);
    }
    return response;
  }

  async addProduct(formData: FormData): Promise<ApiResponse<ProductSM>> {
    return await this.productClient.AddProduct(formData);
  }

  async updateProduct(
    formData: FormData,
    id: number
  ): Promise<ApiResponse<ProductSM>> {
    return await this.productClient.UpdateProduct(formData, id);
  }

   async setIsBestSellingProductState(id: number,state:BoolResponseRoot): Promise<ApiResponse<BoolResponseRoot>> {
    let apiRequest = new ApiRequest<BoolResponseRoot>();
    apiRequest.reqData = state
    return await this.productClient.SetIsBestSellingProduct(id,apiRequest);
  }
  async getAllIsBestSelling(): Promise<ApiResponse<ProductSM[]>> {
    const response = await this.productClient.GetAllIsBestSelling();
    if (!response.isError && response.successData) {
      response.successData = response.successData.map(p => this.normalizeProductData(p));
    }
    return response;
  }

  async getProductReviews(id: number): Promise<ApiResponse<ReviewSM[]>> {
    return await this.productClient.GetProductReviews(id);
  }
  // async addReview(data: ReviewSM): Promise<ApiResponse<ReviewSM>> {
  //   if (data == null) {
  //     throw new Error(AppConstants.ErrorPrompts.Invalid_Input_Data);
  //   } else {
  //     let apiRequest = new ApiRequest<ReviewSM>();
  //     apiRequest.reqData = data;
  //     let resp = await this.productClient.AddReview(apiRequest);
  //     if (resp.isError) {
  //       throw resp.errorData;
  //     }
  //     return resp;
  //   }
  // }
}
