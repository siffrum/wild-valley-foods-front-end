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
import { BannerSM } from '../models/service-models/app/v1/website-resource/banner-s-m';
@Injectable({
  providedIn: 'root',
})
export class BannerClient extends BaseApiClient {
  constructor(
    storageService: StorageService,
    storageCache: StorageCache,
    commonResponseCodeHandler: CommonResponseCodeHandler
  ) {
    super(storageService, storageCache, commonResponseCodeHandler);
  }
  GetAllBanners = async (queryFilter:QueryFilter): Promise<ApiResponse<BannerSM[]>> => {
    let resp = await this.GetResponseAsync<null, BannerSM[]>(`${AppConstants.ApiUrls.Banner}/getall?skip=${queryFilter.skip}&top=${queryFilter.top}`, 'GET');
    return resp;
  };

  GetTotatBannerCount = async (): Promise<ApiResponse<number>> => {
    let resp = await this.GetResponseAsync<null, number>(
      `${AppConstants.ApiUrls.Banner}/count`,
      'GET'
    );
    return resp;
    }

 AddBanner= async (
    addBanner: ApiRequest<BannerSM>
  ): Promise<ApiResponse<BannerSM>> => {
    let resp = await this.GetResponseAsync<BannerSM, BannerSM>(
      `${AppConstants.ApiUrls.Banner}/create`,
      'POST',
      addBanner
    );
    return resp;
  };

  /**delete Banner by id */
  DeleteBannerById = async (
    Id: number
  ): Promise<ApiResponse<DeleteResponseRoot>> => {
    let resp = await this.GetResponseAsync<number, DeleteResponseRoot>(
      `${AppConstants.ApiUrls.Banner}/delete/${Id}`,
      'DELETE'
    );
    return resp;
  };

  GetBannerById = async (Id: number): Promise<ApiResponse<BannerSM>> => {
    let resp = await this.GetResponseAsync<number, BannerSM>(
      `${AppConstants.ApiUrls.Banner}/getbyid/${Id}`,
      'GET'
    );
    return resp;
  };



  /**
   * Update existing Banner
   * 
   * @param updateBanner Banner data to update
   * @returns Promise<ApiResponse<BannerSM>>
   * @example
   * const updatedBanner = new BannerSM();
  
   */
  UpdateBanner = async (
    updateBanner: ApiRequest<BannerSM>
  ): Promise<ApiResponse<BannerSM>> => {
    let resp = await this.GetResponseAsync<BannerSM, BannerSM>(
      `${AppConstants.ApiUrls.Banner}/update/${updateBanner.reqData.id}`,
      'PUT',
      updateBanner
    );
    return resp;
  };
}
