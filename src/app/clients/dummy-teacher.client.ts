import { Injectable } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { BaseApiClient } from './base-client/base-api.client';
import { CommonResponseCodeHandler } from './helpers/common-response-code-handler.helper';
import { StorageCache } from './helpers/storage-cache.helper';
import { QueryFilter } from '../models/service-models/foundation/api-contracts/query-filter';
import { ApiResponse } from '../models/service-models/foundation/api-contracts/base/api-response';
import {
  DummyTeacherSM,
  productSM,
} from '../models/service-models/app/v1/dummy-teacher-s-m';
import { ApiRequest } from '../models/service-models/foundation/api-contracts/base/api-request';
import { DeleteResponseRoot } from '../models/service-models/foundation/common-response/delete-response-root';
import {
  AdditionalRequestDetails,
  Authentication,
} from '../models/internal/additional-request-details';
import { AppConstants } from '../../app-constants';

@Injectable({
  providedIn: 'root',
})
export class DummyTeacherClient extends BaseApiClient {
  constructor(
    storageService: StorageService,
    storageCache: StorageCache,
    commonResponseCodeHandler: CommonResponseCodeHandler
  ) {
    super(storageService, storageCache, commonResponseCodeHandler);
  }
  /**Get teachers based on odata query */
  GetTeachersByOdata = async (
    queryFilter: QueryFilter
  ): Promise<ApiResponse<DummyTeacherSM[]>> => {
    let finalUrl = this.ApplyQueryFilterToUrl(
      `${AppConstants.ApiUrls.DUMMY_TEACHER_URL}`,
      queryFilter
    );
    let resp = await this.GetResponseAsync<number, DummyTeacherSM[]>(
      finalUrl,
      'GET'
    );
    return resp;
  };

  /**Get all teachers */
  GetAllTeachers = async (): Promise<ApiResponse<productSM[]>> => {
    let resp = await this.GetResponseAsync<productSM[], productSM[]>(
      `${AppConstants.ApiUrls.DUMMY_TEACHER_URL}`,
      'GET',
      null,
      new AdditionalRequestDetails<productSM[]>(false, Authentication.false)
    );
    return resp;
  };

  /**Get teacher by id */
  GetTeacherById = async (Id: number): Promise<ApiResponse<DummyTeacherSM>> => {
    let resp = await this.GetResponseAsync<number, DummyTeacherSM>(
      `${AppConstants.ApiUrls.DUMMY_TEACHER_URL}/${Id}`,
      'GET'
    );
    return resp;
  };

  /**Add a new teacher */
  AddTeacher = async (
    addTeacherRequest: ApiRequest<DummyTeacherSM>
  ): Promise<ApiResponse<DummyTeacherSM>> => {
    let resp = await this.GetResponseAsync<DummyTeacherSM, DummyTeacherSM>(
      AppConstants.ApiUrls.DUMMY_TEACHER_URL,
      'POST',
      addTeacherRequest
    );
    return resp;
  };

  /**Update Teacher*/
  UpdateTeacher = async (
    updateTeacherRequest: ApiRequest<DummyTeacherSM>
  ): Promise<ApiResponse<DummyTeacherSM>> => {
    let resp = await this.GetResponseAsync<DummyTeacherSM, DummyTeacherSM>(
      `${AppConstants.ApiUrls.DUMMY_TEACHER_URL}/${updateTeacherRequest.reqData.firstName}`,
      'PUT',
      updateTeacherRequest
    );
    return resp;
  };

  /**delete teacher by id */
  DeleteTeacherById = async (
    Id: number
  ): Promise<ApiResponse<DeleteResponseRoot>> => {
    let resp = await this.GetResponseAsync<number, DeleteResponseRoot>(
      `${AppConstants.ApiUrls.DUMMY_TEACHER_URL}/${Id}`,
      'DELETE'
    );
    return resp;
  };
}
