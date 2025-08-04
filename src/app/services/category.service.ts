import { CategoriesViewModel } from './../models/view/end-user/categories.viewmodel';
import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { ApiResponse } from '../models/service-models/foundation/api-contracts/base/api-response';
import { DeleteResponseRoot } from '../models/service-models/foundation/common-response/delete-response-root';
import { ApiRequest } from '../models/service-models/foundation/api-contracts/base/api-request';
import { BrandSM } from '../models/service-models/app/v1/brand-s-m';
import { BrandViewModel } from '../models/view/end-user/brand.viewmodel';
import { QueryFilter } from '../models/service-models/foundation/api-contracts/query-filter';
import { IntResponseRoot } from '../models/service-models/foundation/common-response/int-response-root';
import { CategoryClient } from '../clients/category.client';
import { ProductCategorySM } from '../models/service-models/app/v1/product-category-s-m';
import { CategoriesSM } from '../models/service-models/app/v1/categories-s-m';
import { AppConstants } from '../../app-constants';

@Injectable({
  providedIn: 'root',
})
export class CategoryService extends BaseService {
  constructor(private categoryClient: CategoryClient) {
    super();
  }

  /**
   * Retrieves all brands from the server.
   *
   * @returns A promise that resolves to an ApiResponse containing an array of BrandSM objects.
   *
   * @throws Will throw an error if the server request fails.
   */
  async getAllCategory(
    viewModel: CategoriesViewModel
  ): Promise<ApiResponse<CategoriesSM[]>> {
    let queryFilter = new QueryFilter();
    queryFilter.skip =
      (viewModel.pagination.PageNo - 1) * viewModel.pagination.PageSize;
    queryFilter.top = viewModel.pagination.PageSize;
    return await this.categoryClient.GetAllCategory(queryFilter);
  }

  async getTotatCategoryCount(): Promise<ApiResponse<IntResponseRoot>> {
    return await this.categoryClient.GetTotatCategoryCount();
  }
  async deleteCategory(id: number): Promise<ApiResponse<DeleteResponseRoot>> {
    if (id <= 0) {
      throw new Error(AppConstants.ErrorPrompts.Delete_Data_Error);
    }
    return await this.categoryClient.DeleteCategoryById(id);
  }

  async getCategoryById(id: number): Promise<ApiResponse<ProductCategorySM>> {
    if (id <= 0) {
      throw new Error(AppConstants.ErrorPrompts.Delete_Data_Error);
    }
    return await this.categoryClient.GetCategoryById(id);
  }

  async addCategory(
    categoryData: ProductCategorySM
  ): Promise<ApiResponse<ProductCategorySM>> {
    if (!categoryData) {
      throw new Error(AppConstants.ErrorPrompts.Invalid_Input_Data);
    } else {
      let apiRequest = new ApiRequest<ProductCategorySM>();
      apiRequest.reqData = categoryData;
      return await this.categoryClient.AddCategory(apiRequest);
    }
  }
  async updateCategory(
    categoryData: ProductCategorySM
  ): Promise<ApiResponse<ProductCategorySM>> {
    if (!categoryData) {
      throw new Error(AppConstants.ErrorPrompts.Invalid_Input_Data);
    } else {
      let apiRequest = new ApiRequest<ProductCategorySM>();
      apiRequest.reqData = categoryData;
      return await this.categoryClient.UpdateCategory(apiRequest);
    }
  }
}
