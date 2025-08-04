import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { ApiResponse } from '../models/service-models/foundation/api-contracts/base/api-response';
import { DeleteResponseRoot } from '../models/service-models/foundation/common-response/delete-response-root';
import { ApiRequest } from '../models/service-models/foundation/api-contracts/base/api-request';
import { QueryFilter } from '../models/service-models/foundation/api-contracts/query-filter';
import { IntResponseRoot } from '../models/service-models/foundation/common-response/int-response-root';
import { BannerClient } from '../clients/banner.client';
import { BannerViewModel } from '../models/view/website-resource/banner.viewmodel';
import { BannerSM } from '../models/service-models/app/v1/website-resource/banner-s-m';
import { AppConstants } from '../../app-constants';

@Injectable({
  providedIn: 'root',
})
export class BannerService extends BaseService {
  constructor(private BannerClient: BannerClient) {
    super();
  }

  /**
   * Retrieves all Banners from the server.
   *
   * @returns A promise that resolves to an ApiResponse containing an array of BannerSM objects.
   *
   * @throws Will throw an error if the server request fails.
   */
  async getAllBanners(viewModel:BannerViewModel): Promise<ApiResponse<BannerSM[]>> {
      let queryFilter = new QueryFilter();
      queryFilter.skip = (viewModel.pagination.PageNo - 1) * viewModel.pagination.PageSize;
      queryFilter.top = viewModel.pagination.PageSize
      return await this.BannerClient.GetAllBanners(queryFilter);
  }

  async getTotatBannersCount(): Promise<ApiResponse<number>> {
    return await this.BannerClient.GetTotatBannerCount()
    }
  async deleteBanner(id: number): Promise<ApiResponse<DeleteResponseRoot>> {
    if (id <= 0) {
      throw new Error(AppConstants.ErrorPrompts.Delete_Data_Error);
    }
    return await this.BannerClient.DeleteBannerById(id);
  }

  async getBannerById(id: number): Promise<ApiResponse<BannerSM>> {
    if (id <= 0) {
      throw new Error(AppConstants.ErrorPrompts.Delete_Data_Error);
    }
    return await this.BannerClient.GetBannerById(id);
  }

  async addBanner(warehouseData: BannerSM): Promise<ApiResponse<BannerSM>> {
    if (!warehouseData) {
      throw new Error(AppConstants.ErrorPrompts.Invalid_Input_Data);
    } else {
      let apiRequest = new ApiRequest<BannerSM>();
      apiRequest.reqData = warehouseData;
      return await this.BannerClient.AddBanner(apiRequest);
    }
  }
  async updateBanner(BannerData: BannerSM): Promise<ApiResponse<BannerSM>> {
    if (!BannerData) {
      throw new Error(AppConstants.ErrorPrompts.Invalid_Input_Data);
    } else {
      let apiRequest = new ApiRequest<BannerSM>();
      apiRequest.reqData = BannerData;
      return await this.BannerClient.UpdateBanner(apiRequest);
    }
  }
}
