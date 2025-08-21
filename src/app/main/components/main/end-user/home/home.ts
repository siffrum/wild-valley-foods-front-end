import { Component } from '@angular/core';
import { Banner } from '../../../internal/End-user/banner/banner';

@Component({
  selector: 'app-home',
  imports: [Banner],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  dummyBanners = [
    {
      title: 'Welcome to Our Sale',
      description: 'Get up to 50% off selected items. Limited time only!',
      imageBase64:
        'https://images.unsplash.com/photo-1615478441828-1b28a6115394?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // replace with a real base64 image string
      link: 'https://example.com/sale',
      ctaText: 'Shop Now',
      bannerType: 'Sales' as const,
      isVisible: true,
    },
    {
      title: 'Exclusive Voucher',
      description: 'Use code SAVE20 to get 20% off your next purchase.',
      imageBase64:
        'https://plus.unsplash.com/premium_photo-1668677227454-213252229b73?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      link: 'https://example.com/voucher',
      ctaText: 'Redeem',
      bannerType: 'Voucher' as const,
      isVisible: true,
    },
    {
      title: 'Summer Collection',
      description: 'Discover our latest summer styles and trends.',
      imageBase64:
        'https://images.unsplash.com/photo-1722886689077-d22d8fc2a305?q=80&w=1025&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      bannerType: 'Slider' as const,
      isVisible: true,
    },
  ];
}
