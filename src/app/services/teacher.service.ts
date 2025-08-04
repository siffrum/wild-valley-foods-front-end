import { Injectable } from '@angular/core';

import { DummyTeacherClient } from '../clients/dummy-teacher.client';
import { BaseService } from './base.service';
import { ApiResponse } from '../models/service-models/foundation/api-contracts/base/api-response';
import { DummyTeacherSM, productSM } from '../models/service-models/app/v1/dummy-teacher-s-m';
import { DeleteResponseRoot } from '../models/service-models/foundation/common-response/delete-response-root';
import { AppConstants } from '../../app-constants';

@Injectable({
  providedIn: 'root',
})
export class TeacherService extends BaseService {
  constructor(private teacherClient: DummyTeacherClient) {
    super();
  }

  async getAllTeachers(): Promise<ApiResponse<productSM[]>> {
    return await this.teacherClient.GetAllTeachers();
  }

  async getTeacherById(id: number): Promise<ApiResponse<DummyTeacherSM>> {
    if (id <= 0) {
      throw new Error(AppConstants.ErrorPrompts.Delete_Data_Error);
    }
    return await this.teacherClient.GetTeacherById(id);
  }
  async deleteTeacher(id: number): Promise<ApiResponse<DeleteResponseRoot>> {
    if (id <= 0) {
      throw new Error(AppConstants.ErrorPrompts.Delete_Data_Error);
    }
    return await this.teacherClient.DeleteTeacherById(id);
  }
}
