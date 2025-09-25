import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { ProductClient } from '../clients/product.client';
import { QueryFilter } from '../models/service-models/foundation/api-contracts/query-filter';
import { ApiResponse } from '../models/service-models/foundation/api-contracts/base/api-response';
import { IntResponseRoot } from '../models/service-models/foundation/common-response/int-response-root';
import { DeleteResponseRoot } from '../models/service-models/foundation/common-response/delete-response-root';
import { AdminProductsViewModel } from '../models/view/Admin/admin-product.viewmodel';
import { ProductSM } from '../models/service-models/app/v1/product-s-m';
import { UserProductViewModel } from '../models/view/end-user/product/user-product.viewmodel';

@Injectable({
  providedIn: 'root',
})
export class ProductService extends BaseService {
  constructor(private productClient: ProductClient) {
    super();
  }

  async getAllProducts(
    viewModel: AdminProductsViewModel
  ): Promise<ApiResponse<ProductSM[]>> {
    const queryFilter = new QueryFilter();
    queryFilter.skip =
      (viewModel.pagination.PageNo - 1) * viewModel.pagination.PageSize;
    queryFilter.top = viewModel.pagination.PageSize;
    return await this.productClient.GetAllProduct(queryFilter);
  }


  async getTotatProductCount(): Promise<ApiResponse<IntResponseRoot>> {
    return await this.productClient.GetTotatProductCount();
  }

    async getAllProductsByCategoryId(
    viewModel: UserProductViewModel
  ): Promise<ApiResponse<ProductSM[]>> {
    const queryFilter = new QueryFilter();
    queryFilter.skip =
      (viewModel.pagination.PageNo - 1) * viewModel.pagination.PageSize;
    queryFilter.top = viewModel.pagination.PageSize;
    let categoryId=viewModel.categoryId;
    return await this.productClient.GetAllProductsByCategoryId(queryFilter,categoryId);
  }
 async getTotatProductCountByCategoryId(categoryId:number): Promise<ApiResponse<IntResponseRoot>> {
    return await this.productClient.GetTotatProductCountByCategoryId(categoryId);
  }
  async deleteProduct(id: number): Promise<ApiResponse<DeleteResponseRoot>> {
    if (id <= 0) {
      throw new Error('Invalid id for delete');
    }
    return await this.productClient.DeleteProductById(id);
  }

  async getProductById(id: number): Promise<ApiResponse<ProductSM>> {
    if (id <= 0) {
      throw new Error('Invalid id for getProductById');
    }
    return await this.productClient.GetProductById(id);
  }

  async addProduct(formData: FormData): Promise<ApiResponse<ProductSM>> {
    return await this.productClient.AddProduct(formData);
  }

  async updateProduct(
    formData: FormData,
    id: number
  ): Promise<ApiResponse<ProductSM>> {
    return await this.productClient.UpdateProduct(formData, id);
  }
  async getAllNewArrivals(): Promise<ApiResponse<ProductSM[]>> {
    return await this.productClient.GetAllNewArrivals();
  }
}
