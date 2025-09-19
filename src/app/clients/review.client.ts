import { Injectable } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { BaseApiClient } from './base-client/base-api.client';
import { CommonResponseCodeHandler } from './helpers/common-response-code-handler.helper';
import { StorageCache } from './helpers/storage-cache.helper';
import { ApiResponse } from '../models/service-models/foundation/api-contracts/base/api-response';
import { DeleteResponseRoot } from '../models/service-models/foundation/common-response/delete-response-root';
import { QueryFilter } from '../models/service-models/foundation/api-contracts/query-filter';
import { IntResponseRoot } from '../models/service-models/foundation/common-response/int-response-root';
import { AppConstants } from '../../app-constants';
import {
  AdditionalRequestDetails,
  Authentication,
} from '../models/internal/additional-request-details';
import { ReviewSM } from '../models/service-models/app/v1/review-s-m';
@Injectable({
  providedIn: 'root',
})
export class ReviewClient extends BaseApiClient {
  constructor(
    storageService: StorageService,
    storageCache: StorageCache,
    commonResponseCodeHandler: CommonResponseCodeHandler
  ) {
    super(storageService, storageCache, commonResponseCodeHandler);
  }
  GetAllPaginatedReviewsByProductId = async (
    queryFilter: QueryFilter
  ): Promise<ApiResponse<ReviewSM[]>> => {
    let resp = await this.GetResponseAsync<null, ReviewSM[]>(
      `${AppConstants.ApiUrls.REVIEW}/GetAllProductreviewsByProductId/1/paginated?skip=${queryFilter.skip}&top=${queryFilter.top}`,
      'GET',
      null,
      new AdditionalRequestDetails<ReviewSM[]>(false, Authentication.false)
    );
    
    return resp;
  };

    GetAllPaginatedReviews = async (
    queryFilter: QueryFilter
  ): Promise<ApiResponse<ReviewSM[]>> => {
    let resp = await this.GetResponseAsync<null, ReviewSM[]>(
      `${AppConstants.ApiUrls.REVIEW}/paginated?skip=${queryFilter.skip}&top=${queryFilter.top}`,
      'GET',
      null,
      new AdditionalRequestDetails<ReviewSM[]>(false, Authentication.false)
    );
    
    return resp;
  };
  GetTotatReviewCount = async (): Promise<ApiResponse<IntResponseRoot>> => {
    let resp = await this.GetResponseAsync<null, IntResponseRoot>(
      `${AppConstants.ApiUrls.REVIEW}/count`,
      'GET',
      null,
      new AdditionalRequestDetails<IntResponseRoot>(false, Authentication.false)
    );
    return resp;
  };

   /** Add a new category */
    AddReview = async (formData: FormData): Promise<ApiResponse<ReviewSM>> => {
      const details = new AdditionalRequestDetails<ReviewSM>(true); // enable auth
      return await this.GetResponseAsync<FormData, ReviewSM>(
        `${AppConstants.ApiUrls.REVIEW}/CreateProductReviewByProductId/1`,
        'POST',
        formData,
        details
      );
    };
  /**delete Review by id */
  DeleteReviewById = async (
    Id: number
  ): Promise<ApiResponse<DeleteResponseRoot>> => {
    let resp = await this.GetResponseAsync<number, DeleteResponseRoot>(
      `${AppConstants.ApiUrls.ADMIN_REVIEW}/ByReviewId/${Id}`,
      'DELETE'
    );
    return resp;
  };

  GetReviewById = async (Id: number): Promise<ApiResponse<ReviewSM>> => {
    let resp = await this.GetResponseAsync<number, ReviewSM>(
      `${AppConstants.ApiUrls.CONTACT_US}/${Id}`,
      'GET'
    );
    return resp;
  };

  /**
   * Update existing Review
   * 
   * @param updateReview Review data to update
   * @returns Promise<ApiResponse<ReviewSM>>
   * @example
   * const updatedReview = new ReviewSM();
  
   */

 
  
    /** Update existing Category */
    UpdateReviewByReviewId = async (
      formData: FormData,
      id: number
    ): Promise<ApiResponse<ReviewSM>> => {
      const details = new AdditionalRequestDetails<ReviewSM>(true); // enable auth
      return await this.GetResponseAsync<FormData, ReviewSM>(
        `${AppConstants.ApiUrls.ADMIN_REVIEW}/ByReviewId//${id}`,
        'PUT',
        formData,
        details
      );
    };
}
