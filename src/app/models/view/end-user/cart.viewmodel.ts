import { BaseViewModel } from '../../internal/base.viewmodel';
import { BannerSM } from '../../service-models/app/v1/website-resource/banner-s-m';
import { BannerViewModel } from '../website-resource/banner.viewmodel';

export class CartViewModel extends BaseViewModel {
  cartItems: CartItem[] = [
    {
      id: 'product1',
      name: 'Stylish Wireless Headphones',
      image: '',
      price: 59.99,
      quantity: 1,
    },
    {
      id: 'product2',
      name: 'Smartwatch with Fitness Tracker',
      image: '',
      price: 129.99,
      quantity: 1,
    },
    {
      id: 'product3',
      name: 'Portable Bluetooth Speaker',
      image: '',
      price: 45.0,
      quantity: 1,
    },
  ];
  taxRate = 0.07; // 7% tax rate, adjust as needed
}
export interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}
