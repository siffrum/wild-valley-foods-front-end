import { CategoriesViewModel } from './../models/view/end-user/categories.viewmodel';
import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { ApiResponse } from '../models/service-models/foundation/api-contracts/base/api-response';
import { DeleteResponseRoot } from '../models/service-models/foundation/common-response/delete-response-root';
import { ApiRequest } from '../models/service-models/foundation/api-contracts/base/api-request';
import { QueryFilter } from '../models/service-models/foundation/api-contracts/query-filter';
import { IntResponseRoot } from '../models/service-models/foundation/common-response/int-response-root';
import { AppConstants } from '../../app-constants';
import { ProductClient } from '../clients/product.client';
import { ProductComponentViewModel } from '../models/view/end-user/product/product-component.viewmodel';
import { ProductSM } from '../models/service-models/app/v1/product-s-m';

@Injectable({
  providedIn: 'root',
})
export class ProductService extends BaseService {
  constructor(private productClient: ProductClient) {
    super();
  }

  /**
   * Retrieves all Products from the server.
   *
   * @returns A promise that resolves to an ApiResponse containing an array of ProductSM objects.
   *
   * @throws Will throw an error if the server request fails.
   */
  async getAllProducts(
    viewModel: ProductComponentViewModel
  ): Promise<ApiResponse<ProductSM[]>> {
    let queryFilter = new QueryFilter();
    queryFilter.skip =
      (viewModel.pagination.PageNo - 1) * viewModel.pagination.PageSize;
    queryFilter.top = viewModel.pagination.PageSize;
    return await this.productClient.GetAllProduct(queryFilter);
  }

  async getTotatProductsCount(): Promise<ApiResponse<IntResponseRoot>> {
    return await this.productClient.GetTotatProductCount();
  }
  async deleteProduct(id: number): Promise<ApiResponse<DeleteResponseRoot>> {
    if (id <= 0) {
      throw new Error(AppConstants.ErrorPrompts.Delete_Data_Error);
    }
    return await this.productClient.DeleteProductById(id);
  }

  async getProductsById(id: number): Promise<ApiResponse<ProductSM>> {
    if (id <= 0) {
      throw new Error(AppConstants.ErrorPrompts.Delete_Data_Error);
    }
    return await this.productClient.GetProductById(id);
  }

  async addCategory(
    categoryData: ProductSM
  ): Promise<ApiResponse<ProductSM>> {
    if (!categoryData) {
      throw new Error(AppConstants.ErrorPrompts.Invalid_Input_Data);
    } else {
      let apiRequest = new ApiRequest<ProductSM>();
      apiRequest.reqData = categoryData;
      return await this.productClient.AddProduct(apiRequest);
    }
  }
  async updateProducts(
    categoryData: ProductSM
  ): Promise<ApiResponse<ProductSM>> {
    if (!categoryData) {
      throw new Error(AppConstants.ErrorPrompts.Invalid_Input_Data);
    } else {
      let apiRequest = new ApiRequest<ProductSM>();
      apiRequest.reqData = categoryData;
      return await this.productClient.UpdateProduct(apiRequest);
    }
  }
}
