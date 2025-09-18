import { BaseViewModel } from '../../internal/base.viewmodel';
import { ProductSM } from '../../service-models/app/v1/product-s-m';
import { BannerSM } from '../../service-models/app/v1/website-resource/banner-s-m';
import { BannerViewModel } from '../website-resource/banner.viewmodel';

export class CartViewModel extends BaseViewModel {
  cartItems: CartItem[] = [];
  taxRate: number = 0; // e.g., 0.07 for 7% tax
}
export interface CartItem {
  id: string;
  product: ProductSM;
  quantity: number;
  name?: string;
  price?: number;
  image?: string;
}
