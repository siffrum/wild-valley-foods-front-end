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
import { ContactUsSM } from '../models/service-models/app/v1/contact-us-s-m';
@Injectable({
  providedIn: 'root',
})
export class ContactUsClient extends BaseApiClient {
  constructor(
    storageService: StorageService,
    storageCache: StorageCache,
    commonResponseCodeHandler: CommonResponseCodeHandler
  ) {
    super(storageService, storageCache, commonResponseCodeHandler);
  }
  GetAllPaginatedContactUs = async (
    queryFilter: QueryFilter
  ): Promise<ApiResponse<ContactUsSM[]>> => {
    let resp = await this.GetResponseAsync<null, ContactUsSM[]>(
      `${AppConstants.ApiUrls.CONTACT_US}/getall/paginated?skip=${queryFilter.skip}&top=${queryFilter.top}`,
      'GET'
    );
    
    return resp;
  };

  GetTotatContactUsCount = async (): Promise<ApiResponse<IntResponseRoot>> => {
    let resp = await this.GetResponseAsync<null, IntResponseRoot>(
      `${AppConstants.ApiUrls.CONTACT_US}/count`,
      'GET'
    );
    return resp;
  };

   /** Add a new category */
    AddContactUs = async (formData: FormData): Promise<ApiResponse<ContactUsSM>> => {
      const details = new AdditionalRequestDetails<ContactUsSM>(true); // enable auth
      return await this.GetResponseAsync<FormData, ContactUsSM>(
        `${AppConstants.ApiUrls.CONTACT_US}/create`,
        'POST',
        formData,
        details
      );
    };
  /**delete ContactUs by id */
  DeleteContactUsById = async (
    Id: number
  ): Promise<ApiResponse<DeleteResponseRoot>> => {
    let resp = await this.GetResponseAsync<number, DeleteResponseRoot>(
      `${AppConstants.ApiUrls.CONTACT_US}/delete/${Id}`,
      'DELETE'
    );
    return resp;
  };

  GetContactUsById = async (Id: number): Promise<ApiResponse<ContactUsSM>> => {
    let resp = await this.GetResponseAsync<number, ContactUsSM>(
      `${AppConstants.ApiUrls.CONTACT_US}/getbyid/${Id}`,
      'GET'
    );
    return resp;
  };

  /**
   * Update existing ContactUs
   * 
   * @param updateContactUs ContactUs data to update
   * @returns Promise<ApiResponse<ContactUsSM>>
   * @example
   * const updatedContactUs = new ContactUsSM();
  
   */

 
  
    /** Update existing Category */
    UpdateContactUs = async (
      formData: FormData,
      id: number
    ): Promise<ApiResponse<ContactUsSM>> => {
      const details = new AdditionalRequestDetails<ContactUsSM>(true); // enable auth
      return await this.GetResponseAsync<FormData, ContactUsSM>(
        `${AppConstants.ApiUrls.CONTACT_US}/update/${id}`,
        'PUT',
        formData,
        details
      );
    };
}
