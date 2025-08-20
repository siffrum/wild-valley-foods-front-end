import { Injectable } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { BaseApiClient } from './base-client/base-api.client';
import { CommonResponseCodeHandler } from './helpers/common-response-code-handler.helper';
import { StorageCache } from './helpers/storage-cache.helper';
import { ApiResponse } from '../models/service-models/foundation/api-contracts/base/api-response';
import { ApiRequest } from '../models/service-models/foundation/api-contracts/base/api-request';
import { DeleteResponseRoot } from '../models/service-models/foundation/common-response/delete-response-root';
import { QueryFilter } from '../models/service-models/foundation/api-contracts/query-filter';
import { IntResponseRoot } from '../models/service-models/foundation/common-response/int-response-root';
import {  CategorySM } from '../models/service-models/app/v1/categories-s-m';
import { AppConstants } from '../../app-constants';
@Injectable({
  providedIn: 'root',
})
export class CategoryClient extends BaseApiClient {
  constructor(
    storageService: StorageService,
    storageCache: StorageCache,
    commonResponseCodeHandler: CommonResponseCodeHandler
  ) {
    super(storageService, storageCache, commonResponseCodeHandler);
  }

/// Add a new category
    AddCategory = async (
    addCategory: ApiRequest<CategorySM>
  ): Promise<ApiResponse<CategorySM>> => {
    let resp = await this.GetResponseAsync<
      CategorySM,
      CategorySM
    >(`${AppConstants.ApiUrls.BASE}/admin/createcategory`, 'POST', addCategory);
    return resp;
  };

  /**
   * Retrieves all Categories from the server.
   *
   * @returns A promise that resolves to an ApiResponse containing an array of CategorySM objects.
   *
   * @throws Will throw an error if the server request fails.
   */
  GetAllCategory = async (
    queryFilter: QueryFilter
  ): Promise<ApiResponse<CategorySM[]>> => {
    let resp = await this.GetResponseAsync<null, CategorySM[]>(
      `${AppConstants.ApiUrls.BASE}?skip=${queryFilter.skip}&top=${queryFilter.top}`,
      'GET'
    );
    return resp;
  };

  /**get total category count */
  GetTotatCategoryCount = async (): Promise<ApiResponse<IntResponseRoot>> => {
    let resp = await this.GetResponseAsync<null, IntResponseRoot>(
      `${AppConstants.ApiUrls.BASE}/categories/count`,
      'GET'
    );
    return resp;
  };
  // Get category by id

    GetCategoryById = async (
    Id: number
  ): Promise<ApiResponse<CategorySM>> => {
    let resp = await this.GetResponseAsync<number, CategorySM>(
      `${AppConstants.ApiUrls.BASE}/categoryById/${Id}`,
      'GET'
    );
    return resp;
  };

  
  /**
   * Update existing Category
   *
   * @param updateCategory Category data to update
   * @returns Promise<ApiResponse<CategorySM>>
   * @example
   * const updatedCategory = new CategorySM();

   */
  UpdateCategory = async (
    updatecategoryData: ApiRequest<CategorySM>
  ): Promise<ApiResponse<CategorySM>> => {
    let resp = await this.GetResponseAsync<
      CategorySM,
      CategorySM
    >(
      `${AppConstants.ApiUrls.BASE}/admin/updatecategoryById/${updatecategoryData.reqData.id}`,
      'PUT',
      updatecategoryData
    );
    return resp;
  };

  /**delete brand by id */
  DeleteCategoryById = async (
    Id: number
  ): Promise<ApiResponse<DeleteResponseRoot>> => {
    let resp = await this.GetResponseAsync<number, DeleteResponseRoot>(
      `${AppConstants.ApiUrls.BASE}/deletecategoryById/${Id}`,
      'DELETE'
    );
    return resp;
  };
}
