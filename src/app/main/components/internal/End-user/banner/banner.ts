import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-banner',
  imports: [CommonModule],
  templateUrl: './banner.html',
  styleUrl: './banner.scss',
})
export class Banner {
  @Input() banners: {
    title: string;
    description: string;
    image_base64: string;
    link?: string;
    ctaText?: string;
    bannerType: 'Slider' | 'ShortAdd' | 'LongAdd' | 'Sales' | 'Voucher';
    isVisible: boolean;
  }[] = [];

  @Input() isVisible: boolean = true;
}
