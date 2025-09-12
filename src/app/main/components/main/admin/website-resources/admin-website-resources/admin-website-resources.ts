import { Component, Input, OnInit } from '@angular/core';
import { BannerSM } from '../../../../../../models/service-models/app/v1/website-resource/banner-s-m';
import { BannerViewModel } from '../../../../../../models/view/website-resource/banner.viewmodel';
import { BaseComponent } from '../../../../../../base.component';
import { CommonService } from '../../../../../../services/common.service';
import { LogHandlerService } from '../../../../../../services/log-handler.service';
import { BannerService } from '../../../../../../services/banner.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-website-resources',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-website-resources.html',
  styleUrl: './admin-website-resources.scss'
})
export class AdminWebsiteResources extends BaseComponent<BannerViewModel> implements OnInit {
  @Input() banner: BannerSM | null = null;
  isSubmitting = false;
  selectedFile: File | null = null;

  constructor(
    commonService: CommonService,
    private logHandler: LogHandlerService,
    private bannerService: BannerService,
    public activeModal: NgbActiveModal,
  ) {
    super(commonService, logHandler);
    this.viewModel = new BannerViewModel();
  }

  ngOnInit() {
    if (this.banner) {
      this.getBannerById(this.banner.id);
    } else {
      this.viewModel.bannerFormData.isVisible = true;
    }
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  async onSubmit(form: any): Promise<void> {
    this.viewModel.FormSubmitted = true;
    if (form.invalid) return;

    this.isSubmitting = true;
    try {
      if (this.banner && this.banner.id) {
        await this.updateBanner();
      } else {
        await this.addBanner();
      }
    } finally {
      this.isSubmitting = false;
    }
  }

private async addBanner() {
  try {
    this._commonService.presentLoading();

     const formData = new FormData();
      formData.append("reqData", JSON.stringify(this.viewModel.bannerFormData));
    if (this.selectedFile) {
      formData.append("imagePath", this.selectedFile);  // ✅ send as "image"
    }

      const resp = await this.bannerService.addBanner(formData);
      if (resp.isError) {
        await this.logHandler.logObject(resp.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: resp.errorData.displayMessage,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      } else {
        this._commonService.showSweetAlertToast({
          title: 'Success',
          text: 'Banner added successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
        this.activeModal.close('saved');
      }
    } catch (error) {
      await this.logHandler.logObject(error);
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: 'Failed to add banner.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } finally {
      this._commonService.dismissLoader();
    }
  }

  private async updateBanner() {
    try {
      this._commonService.presentLoading();
      const formData = new FormData();
      formData.append("reqData", JSON.stringify(this.viewModel.bannerFormData));
      if (this.selectedFile) {
        formData.append("image_base64", this.selectedFile);
      }
      const resp = await this.bannerService.updateBanner(formData, this.viewModel.bannerFormData.id);
      if (resp.isError) {
        await this.logHandler.logObject(resp.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: resp.errorData.displayMessage,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      } else {
        this._commonService.showSweetAlertToast({
          title: 'Success',
          text: 'Banner updated successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
        this.activeModal.close('saved');
      }
    } catch (error) {
      await this.logHandler.logObject(error);
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: 'Failed to update banner.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } finally {
      this._commonService.dismissLoader();
    }
  }

  private async getBannerById(id: number) {
    try {
      this._commonService.presentLoading();
      const resp = await this.bannerService.getBannerById(id);
      if (resp.isError) {
        await this.logHandler.logObject(resp.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: resp.errorData.displayMessage,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      } else {
        this.viewModel.bannerFormData = resp.successData;
      }
    } catch (error) {
      await this.logHandler.logObject(error);
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: 'Failed to load banner details.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } finally {
      this._commonService.dismissLoader();
    }
  }
}
