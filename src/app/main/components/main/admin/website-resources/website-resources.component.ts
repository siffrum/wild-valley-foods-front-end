import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../../../../base.component';
import { BannerViewModel } from '../../../../../models/view/website-resource/banner.viewmodel';
import { CommonService } from '../../../../../services/common.service';
import { LogHandlerService } from '../../../../../services/log-handler.service';
import { BannerService } from '../../../../../services/banner.service';
import { PaginationComponent } from '../../../internal/pagination/pagination.component';

@Component({
  selector: 'app-website-resources',
  imports: [CommonModule, ReactiveFormsModule, PaginationComponent],
  templateUrl: './website-resources.component.html',
  styleUrl: './website-resources.component.scss',
})
export class WebsiteResourcesComponent
  extends BaseComponent<BannerViewModel>
  implements OnInit
{
  protected _logHandler: LogHandlerService;

  constructor(
    private fb: FormBuilder,
    commonService: CommonService,
    logHandler: LogHandlerService,
    private bannerService: BannerService
  ) {
    super(commonService, logHandler);
    this._logHandler = logHandler;
    this.viewModel = new BannerViewModel();
  }

  ngOnInit(): void {
    this.initForm();
    this.loadPageData();
  }

  override async loadPageData(): Promise<void> {
    try {
      this._commonService.presentLoading();
      await this.getTotalCount();
      let resp = await this.bannerService.getAllBanners(this.viewModel);
      if (resp.isError) {
        await this._logHandler.logObject(resp.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: resp.errorData.displayMessage,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      } else {
        this.viewModel.bannerSMList = resp.successData;
        console.log('Banners loaded:', this.viewModel.bannerSMList);

        // this.viewModel.pagination.totalCount = resp.totalCount;
      }
    } catch (error) {
      throw error;
    } finally {
      this._commonService.dismissLoader();
    }
  }
  async getTotalCount(): Promise<void> {
    try {
      this._commonService.presentLoading();
      let resp = await this.bannerService.getTotalBannersCount();
      if (resp.isError) {
        await this._logHandler.logObject(resp.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: resp.errorData.displayMessage,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      } else {
        console.log('Banners loaded:', resp.successData);
        let count = resp.successData;
        this.viewModel.pagination.totalCount = count;
        // alert(`Total Banners Count: ${resp.successData}`);

        // this.viewModel.pagination.totalCount = resp.totalCount;
      }
    } catch (error) {
      throw error;
    } finally {
      this._commonService.dismissLoader();
    }
  }

  /**this function is used to create an event for pagination */
  async loadPagedataWithPagination(pageNumber: number) {
    if (pageNumber && pageNumber > 0) {
      // this.viewModel.PageNo = pageNumber;
      this.viewModel.pagination.PageNo = pageNumber;
      await this.loadPageData();
    }
  }
  initForm(): void {
    this.viewModel.bannerForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      imageBase64: ['', Validators.required],
      link: [''],
      ctaText: [''],
      bannerType: ['Slider'],
      isVisible: [true],
    });
  }

  onImageSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        // 1 MB limit
        alert('Image is too large. Max size is 1MB.');
        return;
      }
      this._commonService
        .convertFileToBase64(file)
        .subscribe((base64: string) => {
          this.viewModel.bannerForm.get('imageBase64')?.setValue(base64);
          console.log('Base64 image:', base64); // optional
        });
    }
  }

  onDebugClick(event: Event): void {
    console.log('Debug click fired!');
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      console.log('Selected file:', file.name);
    }
  }
  onToggleVisibility() {
    const current = this.viewModel.bannerForm.get('isVisible')?.value;
    console.log('Checkbox toggled, new value:', current);
  }
  openAddModal(): void {
    this.viewModel.bannerForm.reset({
      bannerType: 'Slider',
      isVisible: true,
    });
    this.viewModel.showAddModal = true;
  }

  openEditModal(bannerId: number): void {
    // Ensure ID is set for edit
    this.getBannerById(bannerId);
    this.viewModel.showEditModal = true;
  }

  closeAddModal(): void {
    this.viewModel.showAddModal = false;
    this.viewModel.showEditModal = false;
  }

  closeEditModal(): void {
    this.viewModel.showAddModal = false;
    this.viewModel.showEditModal = false;
  }

  async addItem(): Promise<void> {
    try {
      this._commonService.presentLoading();
      if (this.viewModel.bannerForm.valid) {
        const newBanner = this.viewModel.bannerForm.value;
        let resp = await this.bannerService.addBanner(newBanner);
        if (resp.isError) {
          this._commonService.showSweetAlertToast({
            title: 'Error',
            text: resp.errorData?.displayMessage || 'An error occurred',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        } else {
          this._commonService.showSweetAlertToast({
            title: 'Success',
            text: 'Banner added successfully',
            icon: 'success',
            confirmButtonText: 'OK',
          });
          this.viewModel.bannerSM = resp.successData;
          this.loadPageData();
          this.closeAddModal();
        }
      }
    } catch (error) {
      throw error;
    } finally {
      this._commonService.dismissLoader();
    }
  }

  async updateItem() {
    try {
      this._commonService.presentLoading();
      if (this.viewModel.bannerForm.valid) {
        this.viewModel.bannerSM = this.viewModel.bannerForm.value;
        this.viewModel.bannerSM.id = this.viewModel.bannerId; // Ensure ID is set for update
        let resp = await this.bannerService.updateBanner(
          this.viewModel.bannerSM
        );
        if (resp.isError) {
          this._commonService.showSweetAlertToast({
            title: 'Error',
            text: resp.errorData?.displayMessage || 'An error occurred',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        } else {
          this._commonService.showSweetAlertToast({
            title: 'Success',
            text: 'Banner updated successfully',
            icon: 'success',
            confirmButtonText: 'OK',
          });
          this.viewModel.bannerSM = resp.successData;
          this.loadPageData();
          this.closeAddModal();
        }
      }
    } catch (error) {
      throw error;
    } finally {
      this._commonService.dismissLoader();
    }
  }

  async deleteItem(bannerId: number) {
    try {
      this._commonService.presentLoading();
      if (this.viewModel.bannerForm.valid) {
        this.viewModel.bannerSM = this.viewModel.bannerForm.value;
        let resp = await this.bannerService.deleteBanner(bannerId);
        if (resp.isError) {
          this._commonService.showSweetAlertToast({
            title: 'Error',
            text: resp.errorData?.displayMessage || 'An error occurred',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        } else {
          this._commonService.showSweetAlertToast({
            title: 'Success',
            text: 'Banner Deleted successfully',
            icon: 'success',
            confirmButtonText: 'OK',
          });
          //  this.viewModel.bannerSM=resp.successData;
        }
      }
    } catch (error) {
      throw error;
    } finally {
      this._commonService.dismissLoader();
    }
  }

  async getBannerById(bannerId: number) {
    try {
      this._commonService.presentLoading();
      let resp = await this.bannerService.getBannerById(bannerId);
      if (resp.isError) {
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: resp.errorData?.displayMessage || 'An error occurred',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      } else {
        this.viewModel.bannerSM = resp.successData;
        this.viewModel.bannerId = this.viewModel.bannerSM.id;
        console.log('Banner loaded:', this.viewModel.bannerSM);
        this.viewModel.bannerForm.patchValue(this.viewModel.bannerSM);
      }
    } catch (error) {
      throw error;
    } finally {
      this._commonService.dismissLoader();
    }
  }
}
