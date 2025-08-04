import { FormGroup } from '@angular/forms';
import { BaseViewModel } from '../../internal/base.viewmodel';
import { BannerSM } from '../../service-models/app/v1/website-resource/banner-s-m';

export class BannerViewModel extends BaseViewModel {
  bannerSM: BannerSM = new BannerSM();
bannerForm!: FormGroup;
bannerId: number = 0;
  bannerSMList :BannerSM [] = [];
  showAddModal = false;
  showEditModal = false;
}
