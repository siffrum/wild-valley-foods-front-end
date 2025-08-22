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
import { AppConstants } from '../../app-constants';
import { ProductSM } from '../models/service-models/app/v1/product-s-m';
import {
  AdditionalRequestDetails,
  Authentication,
} from '../models/internal/additional-request-details';
import { productSM } from '../models/service-models/app/v1/dummy-teacher-s-m';

@Injectable({
  providedIn: 'root',
})
export class ProductClient extends BaseApiClient {
  constructor(
    storageService: StorageService,
    storageCache: StorageCache,
    commonResponseCodeHandler: CommonResponseCodeHandler
  ) {
    super(storageService, storageCache, commonResponseCodeHandler);
  }
  GetAllProduct = async (
    queryFilter: QueryFilter
  ): Promise<ApiResponse<ProductSM[]>> => {
    let resp = await this.GetResponseAsync<null, ProductSM[]>(
      `${AppConstants.ApiUrls.LOG_URL}?skip=${queryFilter.skip}&top=${queryFilter.top}`,
      'GET'
    );
    return resp;
  };

  GetTotatProductCount = async (): Promise<ApiResponse<IntResponseRoot>> => {
    let resp = await this.GetResponseAsync<null, IntResponseRoot>(
      `${AppConstants.ApiUrls.LOG_URL}/count`,
      'GET'
    );
    return resp;
  };

  /**delete Product by id */
  DeleteProductById = async (
    Id: number
  ): Promise<ApiResponse<DeleteResponseRoot>> => {
    let resp = await this.GetResponseAsync<number, DeleteResponseRoot>(
      `${AppConstants.ApiUrls.LOG_URL}/${Id}`,
      'DELETE'
    );
    return resp;
  };

  GetProductById = async (Id: number): Promise<ApiResponse<ProductSM>> => {
    let resp = await this.GetResponseAsync<number, ProductSM>(
      `${AppConstants.ApiUrls.PRODUCT}/${Id}`,
      'GET',
      null,
      new AdditionalRequestDetails<ProductSM>(false, Authentication.false)
    );
    return resp;
  };

  AddProduct = async (
    addCategory: ApiRequest<ProductSM>
  ): Promise<ApiResponse<ProductSM>> => {
    let resp = await this.GetResponseAsync<ProductSM, ProductSM>(
      `${AppConstants.ApiUrls.LOG_URL}`,
      'POST',
      addCategory
    );
    return resp;
  };

  /**
   * Update existing Product
   *
   * @param updateProduct Product data to update
   * @returns Promise<ApiResponse<ProductSM>>
   * @example
   * const updatedProduct = new ProductSM();

   */
  UpdateProduct = async (
    updatecategoryData: ApiRequest<ProductSM>
  ): Promise<ApiResponse<ProductSM>> => {
    let resp = await this.GetResponseAsync<ProductSM, ProductSM>(
      `${AppConstants.ApiUrls.LOG_URL}/${updatecategoryData.reqData.id}`,
      'PUT',
      updatecategoryData
    );
    return resp;
  };
}
