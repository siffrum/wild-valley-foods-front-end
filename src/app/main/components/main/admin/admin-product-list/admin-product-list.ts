import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../../../../base.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductService } from '../../../../../services/product.service';
import { CommonService } from '../../../../../services/common.service';
import { LogHandlerService } from '../../../../../services/log-handler.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../internal/pagination/pagination.component';
import { AdminProductForm } from './admin-product-form/admin-product-form';
import { ProductSM } from '../../../../../models/service-models/app/v1/product-s-m';
import { AdminProductsViewModel } from '../../../../../models/view/Admin/admin-product.viewmodel';
import { ProductVariantSM } from '../../../../../models/service-models/app/v1/variants-s-m';

@Component({
  selector: 'app-admin-product-list',
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './admin-product-list.html',
  styleUrl: './admin-product-list.scss'
})
export class AdminProductList extends BaseComponent<AdminProductsViewModel> implements OnInit {
  protected _logHandler: LogHandlerService;

  constructor(
    commonService: CommonService,
    logHandler: LogHandlerService,
    private modalService: NgbModal,
    private productService: ProductService
  ) {
    super(commonService, logHandler);
    this._logHandler = logHandler;
    this.viewModel = new AdminProductsViewModel();
  }

  ngOnInit() {
    this.loadPageData();
  }

  override async loadPageData() {
    try {
      this._commonService.presentLoading();
      const resp = await this.productService.getAllProducts(this.viewModel);
      if (resp.isError) {
        await this._logHandler.logObject(resp.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: resp.errorData.displayMessage,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } else {
        this.viewModel.products = resp.successData;
        this.viewModel.filteredProducts = [...resp.successData];
        // console.log(this.viewModel.filteredProducts);
        
        this.sortData();
        await this.TotalProductCount();
      }
    } catch (error) {
      await this._logHandler.logObject(error);
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: 'Failed to load products.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      this._commonService.dismissLoader();
    }
  }
 async setIsBestSellingState(id:number,state:boolean) {
    try {
      this._commonService.presentLoading();
      this.viewModel.boolResponseRoot.boolResponse=state;
      const resp = await this.productService.setIsBestSellingProductState(id,this.viewModel.boolResponseRoot);
      if (resp.isError) {
        await this._logHandler.logObject(resp.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: resp.errorData.displayMessage,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } else {
        this.viewModel.boolResponseRoot = resp.successData;
        this.loadPageData()
      }
    } catch (error) {
      await this._logHandler.logObject(error);
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: 'Failed to load products.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      this._commonService.dismissLoader();
    }
  }

   private async updateProduct() {
    try {
      this._commonService.presentLoading();
      const formData = new FormData();
      formData.append('reqData', JSON.stringify(this.viewModel.productFormData));
      const resp = await this.productService.updateProduct(formData, this.viewModel.productFormData.id);
      if (resp.isError) {
        await this._logHandler.logObject(resp.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: resp.errorData.displayMessage,
          icon: 'error'
        });
      } else {
        this._commonService.showSweetAlertToast({
          title: 'Success',
          text: 'Product state updated successfully.',
          icon: 'success'
        });
      }
    } catch (error) {
      await this._logHandler.logObject(error);
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: 'Failed to update product.',
        icon: 'error'
      });
    } finally {
      this._commonService.dismissLoader();
    }
  }
  /**
   * Get total stock across all variants for a product
   * REFACTOR: Helper method to calculate total variant stock
   */
  getTotalStock(product: ProductSM): number {
    if (!product.variants || product.variants.length === 0) {
      return 0;
    }
    return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  }

  /**
   * Get category name from product
   * REFACTOR: Helper method to safely access category
   */
  getCategoryName(product: ProductSM): string {
    return (product as any).category?.name || '-';
  }

  async TotalProductCount() {
    try {
      this._commonService.presentLoading();
      const resp = await this.productService.getTotatProductCount();
      if (resp.isError) {
        await this._logHandler.logObject(resp.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: resp.errorData.displayMessage,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      } else {
        this.viewModel.pagination.totalCount = resp.successData.intResponse;
      }
    } catch (error) {
      await this._logHandler.logObject(error);
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: 'Failed to load product count.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } finally {
      this._commonService.dismissLoader();
    }
  }
  async loadPagedataWithPagination(pageNumber: number) {
    if (pageNumber && pageNumber > 0) {
      this.viewModel.pagination.PageNo = pageNumber;
      await this.loadPageData();
    }
  }

  applyFilter(): void {
    if (!this.viewModel.searchTerm) {
      this.viewModel.filteredProducts = [...this.viewModel.products];
    } else {
      const term = this.viewModel.searchTerm.toLowerCase();
      this.viewModel.filteredProducts = this.viewModel.products.filter(p =>
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term)) ||
        // (p.sku && p.sku.toLowerCase().includes(term)) ||
        ((p as any).category && (p as any).category.name && (p as any).category.name.toLowerCase().includes(term))
      );
    }
    this.sortData();
  }

  sortData(field?: string): void {
    if (field) {
      if (this.viewModel.sortField === field) {
        this.viewModel.sortDirection = this.viewModel.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.viewModel.sortField = field;
        this.viewModel.sortDirection = 'asc';
      }
    }

    this.viewModel.filteredProducts.sort((a, b) => {
      let valueA: any = a[this.viewModel.sortField as keyof ProductSM];
      let valueB: any = b[this.viewModel.sortField as keyof ProductSM];

      if (typeof valueA === 'string') valueA = valueA.toLowerCase();
      if (typeof valueB === 'string') valueB = valueB.toLowerCase();

      if (valueA === undefined && valueB === undefined) return 0;
      if (valueA === undefined) return this.viewModel.sortDirection === 'asc' ? 1 : -1;
      if (valueB === undefined) return this.viewModel.sortDirection === 'asc' ? -1 : 1;
      if (valueA < valueB) return this.viewModel.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.viewModel.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getSortIcon(field: string): string {
    if (this.viewModel.sortField !== field) return 'bi-sort';
    return this.viewModel.sortDirection === 'asc' ? 'bi-sort-up' : 'bi-sort-down';
  }

 

  openFormModal(product?: ProductSM): void {
    const modalRef = this.modalService.open(AdminProductForm, {
      centered: true,
      size: 'lg'
    });
    modalRef.componentInstance.product = product || null;
    modalRef.result.then((result) => {
      if (result === 'saved') {
        this.loadPageData();
      }
    }).catch(() => {});
  }

  async confirmDelete(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        this._commonService.presentLoading();
        const resp = await this.productService.deleteProduct(id);
        if (resp.isError) {
          await this._logHandler.logObject(resp.errorData);
          this._commonService.showSweetAlertToast({
            title: 'Error',
            text: resp.errorData.displayMessage,
            icon: 'error'
          });
        } else {
          this._commonService.showSweetAlertToast({
            title: 'Success',
            text: 'Product deleted successfully.',
            icon: 'success'
          });
          await this.loadPageData();
        }
      } catch (error) {
        await this._logHandler.logObject(error);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: 'Failed to delete product.',
          icon: 'error'
        });
      } finally {
        this._commonService.dismissLoader();
      }
    }
  }
}
