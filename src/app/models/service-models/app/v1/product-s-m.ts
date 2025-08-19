import { WildValleyFoodsServiceModelBase } from "../base/WildValleyFoods-service-model-base";
import { CategorySM } from "./categories-s-m";

export class ProductSM extends WildValleyFoodsServiceModelBase<number>{
  name!: string;
  description?: string;
  price!: number;
  sku!: string;
  stock: number = 0;
  weight?: number;
  packageDetails?: any;     // can refine later if structure is fixed
  shippingOptions?: any;    // same here
  paymentOptions?: any;     // same here
  razorpayOrderId?: string;
  categoryId!: number;
  category!: CategorySM; 
}