import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { ApiResponse } from '../models/service-models/foundation/api-contracts/base/api-response';
import { DeleteResponseRoot } from '../models/service-models/foundation/common-response/delete-response-root';
import { QueryFilter } from '../models/service-models/foundation/api-contracts/query-filter';
import { IntResponseRoot } from '../models/service-models/foundation/common-response/int-response-root';
import { AppConstants } from '../../app-constants';
import { ApiRequest } from '../models/service-models/foundation/api-contracts/base/api-request';
import { VideoClient } from '../clients/video.client';
import { VideoViewModel } from '../models/view/website-resource/video.viewmodel';
import { VideoSM } from '../models/service-models/app/v1/website-resource/video-s-m';


@Injectable({
  providedIn: 'root',
})
export class VideoService extends BaseService {
  constructor(private VideoClient: VideoClient) {
    super();
  }

/**
   * Retrieves all Videos from the server.
   *
   * @returns A promise that resolves to an ApiResponse containing an array of VideoSM objects.
   *
   * @throws Will throw an error if the server request fails.
   */
  async getAllPaginatedVideo(
    viewModel: VideoViewModel
  ): Promise<ApiResponse<VideoSM[]>> {
    let queryFilter = new QueryFilter();
    queryFilter.skip =
      (viewModel.pagination.PageNo - 1) * viewModel.pagination.PageSize;
    queryFilter.top = viewModel.pagination.PageSize;
    return await this.VideoClient.GetAllPaginatedVideo(queryFilter);
  }

  async getTotalVideoCount(): Promise<ApiResponse<IntResponseRoot>> {
    return await this.VideoClient.GetTotatVideoCount();
  }
  async deleteVideo(id: number): Promise<ApiResponse<DeleteResponseRoot>> {
    if (id <= 0) {
      throw new Error(AppConstants.ErrorPrompts.Delete_Data_Error);
    }
    return await this.VideoClient.DeleteVideoById(id);
  }

  async getVideoById(id: number): Promise<ApiResponse<VideoSM>> {
    if (id <= 0) {
      throw new Error(AppConstants.ErrorPrompts.Delete_Data_Error);
    }
    return await this.VideoClient.GetVideoById(id);
  }


async addVideo(formData: VideoSM): Promise<ApiResponse<VideoSM>> {
let apiRequest = new ApiRequest<VideoSM>();
      apiRequest.reqData = formData;
  return await this.VideoClient.AddVideo(apiRequest);
}
async updateVideo(formData: VideoSM): Promise<ApiResponse<VideoSM>> {
  const apiRequest = new ApiRequest<VideoSM>();
  apiRequest.reqData = formData;   // ✅ properly wrap

  return await this.VideoClient.UpdateVideo(apiRequest);
}

}
