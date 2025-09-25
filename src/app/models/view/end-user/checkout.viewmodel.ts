import { BaseViewModel } from '../../internal/base.viewmodel';
import { ProductSM } from '../../service-models/app/v1/product-s-m';

export class CheckoutViewModel extends BaseViewModel {
  cartItems: ProductSM[] = [];
  totalPrice: number = 0;
  address: any = {
    fullName: '',
    addressLine: '',
    city: '',
    postalCode: '',
    country: '',
  };
  paymentMethod: string = 'online';
}
