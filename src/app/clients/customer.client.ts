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
import { ApiRequest } from '../models/service-models/foundation/api-contracts/base/api-request';
import { CustomerDetailSM } from '../models/service-models/app/v1/customer-detail-s-m';

@Injectable({
  providedIn: 'root',
})
export class CustomerClient extends BaseApiClient {
  constructor(
    storageService: StorageService,
    storageCache: StorageCache,
    commonResponseCodeHandler: CommonResponseCodeHandler
  ) {
    super(storageService, storageCache, commonResponseCodeHandler);
  }
  GetAllPaginatedCustomers = async (
    queryFilter: QueryFilter
  ): Promise<ApiResponse<CustomerDetailSM[]>> => {
    let resp = await this.GetResponseAsync<null, CustomerDetailSM[]>(
      `${AppConstants.ApiUrls.CUSTOMER}/getall/paginated?skip=${queryFilter.skip}&top=${queryFilter.top}`,
      'GET'
    );

    return resp;
  };

  GetTotatCustomersCount = async (): Promise<ApiResponse<IntResponseRoot>> => {
    let resp = await this.GetResponseAsync<null, IntResponseRoot>(
      `${AppConstants.ApiUrls.CUSTOMER}/count`,
      'GET'
    );
    return resp;
  };

  /** Add a new customer */
  CreateCustomers = async (
    contactUsFormData: ApiRequest<CustomerDetailSM>
  ): Promise<ApiResponse<CustomerDetailSM>> => {
    let resp = await this.GetResponseAsync<CustomerDetailSM, CustomerDetailSM>(
      `${AppConstants.ApiUrls.CUSTOMER}/create`,
      'POST',
      contactUsFormData,
      new AdditionalRequestDetails<CustomerDetailSM>(
        false,
        Authentication.false
      )
    );
    return resp;
  };
  /**
   * Update existing Customer
   * 
   * @param updateCustomer Customer data to update
   * @returns Promise<ApiResponse<CustomerDetailSM>>
   * @example
   * const updatedContactUs = new CustomerDetailSM();
  
   */
  UpdateCustomer = async (
    apiRequest: ApiRequest<CustomerDetailSM>
  ): Promise<ApiResponse<CustomerDetailSM>> => {
    return await this.GetResponseAsync<CustomerDetailSM, CustomerDetailSM>(
      `${AppConstants.ApiUrls.CUSTOMER}/update/${apiRequest.reqData.id}`,
      'PUT',
      apiRequest, // ✅ this is now valid JSON
      new AdditionalRequestDetails<CustomerDetailSM>(true, Authentication.true)
    );
  };
  ProceedToOrder = async (
    apiRequest: ApiRequest<any>
  ): Promise<ApiResponse<any>> => {
    console.log(apiRequest);

    let resp = await this.GetResponseAsync<number, any>(
      `${AppConstants.ApiUrls.ORDER}`,
      'POST',
      apiRequest,
      new AdditionalRequestDetails<any>(true, Authentication.false)
    );
    return resp;
  };

  VerifyPayment = async (
    apiRequest: ApiRequest<any>
  ): Promise<ApiResponse<any>> => {
    console.log(apiRequest);

    let resp = await this.GetResponseAsync<number, any>(
      `${AppConstants.ApiUrls.ORDER}/verify`,
      'POST',
      apiRequest,
      new AdditionalRequestDetails<any>(true, Authentication.false)
    );
    return resp;
  };

  /**delete ContactUs by id */
  DeleteCustomerById = async (
    Id: number
  ): Promise<ApiResponse<DeleteResponseRoot>> => {
    let resp = await this.GetResponseAsync<number, DeleteResponseRoot>(
      `${AppConstants.ApiUrls.CUSTOMER}/delete/${Id}`,
      'DELETE'
    );
    return resp;
  };

  GetCustomerById = async (
    Id: number
  ): Promise<ApiResponse<CustomerDetailSM>> => {
    let resp = await this.GetResponseAsync<number, CustomerDetailSM>(
      `${AppConstants.ApiUrls.CUSTOMER}/getbyid/${Id}`,
      'GET'
    );
    return resp;
  };
}
