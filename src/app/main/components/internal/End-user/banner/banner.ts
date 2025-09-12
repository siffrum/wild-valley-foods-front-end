import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BannerSM } from '../../../../../models/service-models/app/v1/website-resource/banner-s-m';

@Component({
  selector: 'app-banner',
  imports: [CommonModule],
  templateUrl: './banner.html',
  styleUrl: './banner.scss',
})
export class Banner {
  @Input() banners: BannerSM[] = [];

  @Input() isVisible: boolean = true;
}
