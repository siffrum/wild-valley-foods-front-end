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
import { VideoSM } from '../models/service-models/app/v1/website-resource/video-s-m';
@Injectable({
  providedIn: 'root',
})
export class VideoClient extends BaseApiClient {
  constructor(
    storageService: StorageService,
    storageCache: StorageCache,
    commonResponseCodeHandler: CommonResponseCodeHandler
  ) {
    super(storageService, storageCache, commonResponseCodeHandler);
  }
  GetAllPaginatedVideo = async (
    queryFilter: QueryFilter
  ): Promise<ApiResponse<VideoSM[]>> => {
    let resp = await this.GetResponseAsync<null, VideoSM[]>(
      `${AppConstants.ApiUrls.VIDEO}/paginated?skip=${queryFilter.skip}&top=${queryFilter.top}`,
      'GET',
      null,
      new AdditionalRequestDetails<VideoSM[]>(false, Authentication.false)
    );
    
    return resp;
  };

  GetTotatVideoCount = async (): Promise<ApiResponse<IntResponseRoot>> => {
    let resp = await this.GetResponseAsync<null, IntResponseRoot>(
      `${AppConstants.ApiUrls.VIDEO}/count`,
      'GET',
      null,
      new AdditionalRequestDetails<IntResponseRoot>(false, Authentication.false)
    );
    return resp;
  };

   /** Add a new category */
    AddVideo = async (formData: FormData): Promise<ApiResponse<VideoSM>> => {
      const details = new AdditionalRequestDetails<VideoSM>(true); // enable auth
      return await this.GetResponseAsync<FormData, VideoSM>(
        `${AppConstants.ApiUrls.VIDEO}/create`,
        'POST',
        formData,
        details
      );
    };
  /**delete Video by id */
  DeleteVideoById = async (
    Id: number
  ): Promise<ApiResponse<DeleteResponseRoot>> => {
    let resp = await this.GetResponseAsync<number, DeleteResponseRoot>(
      `${AppConstants.ApiUrls.VIDEO}/${Id}`,
      'DELETE'
    );
    return resp;
  };

  GetVideoById = async (Id: number): Promise<ApiResponse<VideoSM>> => {
    let resp = await this.GetResponseAsync<number, VideoSM>(
      `${AppConstants.ApiUrls.VIDEO}/${Id}`,
      'GET'
    );
    return resp;
  };

  /**
   * Update existing Video
   * 
   * @param updateVideo Video data to update
   * @returns Promise<ApiResponse<VideoSM>>
   * @example
   * const updatedVideo = new VideoSM();
  
   */

 
  
    /** Update existing Category */
    UpdateVideo = async (
      formData: FormData,
      id: number
    ): Promise<ApiResponse<VideoSM>> => {
      const details = new AdditionalRequestDetails<VideoSM>(true); // enable auth
      return await this.GetResponseAsync<FormData, VideoSM>(
        `${AppConstants.ApiUrls.VIDEO}/${id}`,
        'PUT',
        formData,
        details
      );
    };
}
