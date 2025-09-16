import { Component, Input, OnInit } from '@angular/core';
import { BaseComponent } from '../../../../../../base.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductService } from '../../../../../../services/product.service';
import { CommonService } from '../../../../../../services/common.service';
import { LogHandlerService } from '../../../../../../services/log-handler.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../../../../services/category.service';
import { AdminCategoriesViewModel } from '../../../../../../models/view/Admin/admin.categories.viewmodel';
import { CategorySM } from '../../../../../../models/service-models/app/v1/categories-s-m';
import { ProductSM } from '../../../../../../models/service-models/app/v1/product-s-m';
import { AdminProductsViewModel } from '../../../../../../models/view/Admin/admin-product.viewmodel';

@Component({
  selector: 'app-admin-product-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-product-form.html',
  styleUrl: './admin-product-form.scss'
})
export class AdminProductForm extends BaseComponent<AdminProductsViewModel> implements OnInit {
  @Input() product: ProductSM | null = null;

  isSubmitting = false;
  selectedFiles: File[] = [];
  protected _logHandler: any;

  constructor(
    commonService: CommonService,
    logHandler: LogHandlerService,
    private productService: ProductService,
    private categoryService: CategoryService,
    public activeModal: NgbActiveModal
  ) {
    super(commonService, logHandler);
    this._logHandler = logHandler;
    this.viewModel = new AdminProductsViewModel();
  }

  async ngOnInit() {
    // load categories for dropdown
    await this.loadCategories();

    if (this.product) {
      await this.getProductById(this.product.id);
    } else {
      // defaults
      this.viewModel.productFormData.currency = 'INR';
      this.viewModel.productFormData.stock = 0;
      this.viewModel.productFormData.price = 0;
      this.viewModel.productFormData.categoryId = 0;
    }
  }

  async loadCategories() {
    try {
      this._commonService.presentLoading();
      const catVm = new AdminCategoriesViewModel();
      catVm.pagination.PageNo = 1;
      catVm.pagination.PageSize = 1000; // fetch all (practical)
      const resp = await this.categoryService.getAllCategories(catVm);
      if (resp.isError) {
        await this._logHandler.logObject(resp.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: resp.errorData.displayMessage,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } else {
        this.viewModel.categories = resp.successData || [];
      }
    } catch (error) {
      await this._logHandler.logObject(error);
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: 'Failed to load categories.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      this._commonService.dismissLoader();
    }
  }

  onFileChange(event: any): void {
    const files = event.target.files;
    if (files && files.length) {
      this.selectedFiles = Array.from(files);
    }
  }

  hasImages(): boolean {
    // used for validation: either existing images present or user selected new files (create needs images)
    const existing = !!(this.viewModel.productFormData.images && this.viewModel.productFormData.images.length > 0);
    return this.selectedFiles.length > 0 || existing;
  }

  async onSubmit(form: any): Promise<void> {
    this.viewModel.FormSubmitted = true;
    if (form.invalid) return;

    if (!this.hasImages()) return;

    this.isSubmitting = true;
    try {
      if (this.product && this.product.id) {
        await this.updateProduct();
      } else {
        await this.addProduct();
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  private async addProduct() {
    try {
      this._commonService.presentLoading();
      const formData = new FormData();
      formData.append('reqData', JSON.stringify(this.viewModel.productFormData));
      for (const f of this.selectedFiles) {
        formData.append('images', f);
      }

      const resp = await this.productService.addProduct(formData);
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
          text: 'Product added successfully.',
          icon: 'success'
        });
        this.activeModal.close('saved');
      }
    } catch (error) {
      await this._logHandler.logObject(error);
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: 'Failed to add product.',
        icon: 'error'
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
      // if new files selected -> append them (server will replace existing)
      for (const f of this.selectedFiles) {
        formData.append('images', f);
      }

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
          text: 'Product updated successfully.',
          icon: 'success'
        });
        this.activeModal.close('saved');
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

  private async getProductById(id: number) {
    try {
      this._commonService.presentLoading();
      const resp = await this.productService.getProductById(id);
      if (resp.isError) {
        await this._logHandler.logObject(resp.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: resp.errorData.displayMessage,
          icon: 'error'
        });
      } else {
        this.viewModel.productFormData = resp.successData;
        // Note: existing images are available in viewModel.productFormData.images (server returned base64 strings)
      }
    } catch (error) {
      await this._logHandler.logObject(error);
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: 'Failed to load product details.',
        icon: 'error'
      });
    } finally {
      this._commonService.dismissLoader();
    }
  }
}
