import { Injectable } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { BaseApiClient } from './base-client/base-api.client';
import { CommonResponseCodeHandler } from './helpers/common-response-code-handler.helper';
import { StorageCache } from './helpers/storage-cache.helper';
import { ApiResponse } from '../models/service-models/foundation/api-contracts/base/api-response';
import { DeleteResponseRoot } from '../models/service-models/foundation/common-response/delete-response-root';
import { IntResponseRoot } from '../models/service-models/foundation/common-response/int-response-root';
import { AppConstants } from '../../app-constants';
import {
  AdditionalRequestDetails,
  Authentication,
} from '../models/internal/additional-request-details';
import { QueryFilter } from '../models/service-models/foundation/api-contracts/query-filter';
import { ProductSM } from '../models/service-models/app/v1/product-s-m';
import { ReviewSM } from '../models/service-models/app/v1/review-s-m';
import { ApiRequest } from '../models/service-models/app/base/api-request';

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

  /** Add a new product */
  AddProduct = async (formData: FormData): Promise<ApiResponse<ProductSM>> => {
    const details = new AdditionalRequestDetails<ProductSM>(true);
    return await this.GetResponseAsync<FormData, ProductSM>(
      `${AppConstants.ApiUrls.BASE}/admin/product/createproduct`,
      'POST',
      formData,
      details
    );
  };

  /** Update existing Product */
  UpdateProduct = async (
    formData: FormData,
    id: number
  ): Promise<ApiResponse<ProductSM>> => {
    const details = new AdditionalRequestDetails<ProductSM>(true);
    return await this.GetResponseAsync<FormData, ProductSM>(
      `${AppConstants.ApiUrls.BASE}/admin/product/updateproductById/${id}`,
      'PUT',
      formData,
      details
    );
  };

  /** Retrieves all Products (paginated) */
  GetAllProduct = async (
    queryFilter: QueryFilter
  ): Promise<ApiResponse<ProductSM[]>> => {
    return await this.GetResponseAsync<null, ProductSM[]>(
      `${AppConstants.ApiUrls.BASE}/product/paginated?skip=${queryFilter.skip}&top=${queryFilter.top}`,
      'GET',
      null,
      new AdditionalRequestDetails<ProductSM[]>(false, Authentication.false)
    );
  };
  /** Retrieves all Products by search string */
  GetAllProductsBySearhString = async (
    searchString: string
  ): Promise<ApiResponse<ProductSM[]>> => {
    return await this.GetResponseAsync<null, ProductSM[]>(
      `${AppConstants.ApiUrls.BASE}/product/search/?q=${searchString}`,
      'GET',
      null,
      new AdditionalRequestDetails<ProductSM[]>(false, Authentication.false)
    );
  };

  /** Retrieves all Products (paginated) By category Id */
  GetAllProductsByCategoryId = async (
    queryFilter: QueryFilter,
    categoryId: number
  ): Promise<ApiResponse<ProductSM[]>> => {
    return await this.GetResponseAsync<null, ProductSM[]>(
      `${AppConstants.ApiUrls.BASE}/product/ByCategoryId/${categoryId}/paginated?skip=${queryFilter.skip}&top=${queryFilter.top}`,
      'GET',
      null,
      new AdditionalRequestDetails<ProductSM[]>(false, Authentication.false)
    );
  };
  /** Get total product count  By CategoryId*/
  GetTotatProductCountByCategoryId = async (
    categoryId: number
  ): Promise<ApiResponse<IntResponseRoot>> => {
    return await this.GetResponseAsync<null, IntResponseRoot>(
      `${AppConstants.ApiUrls.BASE}/product/count/ByCategoryId/${categoryId}`,
      'GET',
      null,
      new AdditionalRequestDetails<IntResponseRoot>(false, Authentication.false)
    );
  };

  /** Get total product count */
  GetTotatProductCount = async (): Promise<ApiResponse<IntResponseRoot>> => {
    return await this.GetResponseAsync<null, IntResponseRoot>(
      `${AppConstants.ApiUrls.BASE}/product/count`,
      'GET',
      null,
      new AdditionalRequestDetails<IntResponseRoot>(false, Authentication.false)
    );
  };

  /** Get product by id */
  GetProductById = async (Id: number): Promise<ApiResponse<ProductSM>> => {
    return await this.GetResponseAsync<number, ProductSM>(
      `${AppConstants.ApiUrls.BASE}/product/${Id}`,
      'GET',
      null,
      new AdditionalRequestDetails<ProductSM>(false, Authentication.false)
    );
  };

  /** Delete product by id */
  DeleteProductById = async (
    Id: number
  ): Promise<ApiResponse<DeleteResponseRoot>> => {
    const details = new AdditionalRequestDetails<DeleteResponseRoot>(true);
    return await this.GetResponseAsync<number, DeleteResponseRoot>(
      `${AppConstants.ApiUrls.BASE}/admin/product/deleteproductById/${Id}`,
      'DELETE',
      null,
      details
    );
  };

  GetAllNewArrivals = async (): Promise<ApiResponse<ProductSM[]>> => {
    return await this.GetResponseAsync<null, ProductSM[]>(
      `${AppConstants.ApiUrls.BASE}/product/new-arrivals`,
      'GET',
      null,
      new AdditionalRequestDetails<ProductSM[]>(false, Authentication.false)
    );
  };
  GetProductReviews = async (id: number): Promise<ApiResponse<ReviewSM[]>> => {
    return await this.GetResponseAsync<null, ReviewSM[]>(
      `${AppConstants.ApiUrls.BASE}/review/GetAllPaginatedProductReviewsByProductId/${id}`,
      'GET',
      null,
      new AdditionalRequestDetails<ReviewSM[]>(false, Authentication.false)
    );
  };

  // AddReview = async (
  //   ReviewFormData: ReviewSM
  // ): Promise<ApiRequest<ReviewSM>> => {
  //   return await this.GetResponseAsync<ReviewSM, ReviewSM>(
  //     `${AppConstants.ApiUrls.BASE}/review/AddReview`,
  //     'POST',
  //     ReviewFormData,
  //     new AdditionalRequestDetails<ReviewSM>(false, Authentication.false)
  //   );
  // };
  // AddReview = async (add: ReviewSM): Promise<ApiResponse<ReviewSM>> => {
  //   console.log(add);

  //   let resp = await this.GetResponseAsync<ReviewSM, ReviewSM>(
  //     AppConstants.ApiUrls.BASE +
  //       '/review/CreateProductReviewByProductId/' +
  //       add.productId,
  //     'POST',
  //     add,
  //     null,
  //     new AdditionalRequestDetails<ReviewSM>(false, Authentication.false)
  //   );
  //   return resp;
  // };

  // AddReview = async (
  //   reviewFormData: ApiRequest<ReviewSM>
  // ): Promise<ApiResponse<ReviewSM>> => {
  //   let resp = await this.GetResponseAsync<ReviewSM, ReviewSM>(
  //     `${AppConstants.ApiUrls.CONTACT_US}/create`,
  //     'POST',
  //     reviewFormData,

  //     new AdditionalRequestDetails<ReviewSM>(false, Authentication.false)
  //   );
  //   return resp;
  // };
}
