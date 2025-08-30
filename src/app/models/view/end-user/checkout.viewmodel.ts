import { BaseViewModel } from "../../internal/base.viewmodel";

export class CheckoutViewModel extends BaseViewModel{
     cartItems: any[] = [];
  totalPrice: number = 0;
  address: any = {
    fullName: '',
    addressLine: '',
    city: '',
    postalCode: '',
    country: ''
  };
}