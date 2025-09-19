import { WildValleyFoodsServiceModelBase } from '../base/WildValleyFoods-service-model-base';
import { CategorySM } from './categories-s-m';

export class ProductSM extends WildValleyFoodsServiceModelBase<number> {
  name!: string;
  description?: string;
  richDescription?: string;
  itemId?: string;
  price!: number;
  sku!: string;
  stock!: number;
  weight?: number;
  shippingOptions?: any;
  paymentOptions?: any;
  currency!: string;
  category!: CategorySM;
  razorpayItemId?: string;
  hsnCode?: string;
  taxRate?: number;
  unit?: string;
  addedAt?: number;
  status?: string;
  categoryId!: number;
  // backend returns base64 images array as `images` (converted by server)
  images?: string[]; // e.g. ["data:image/png;base64,...", ...]
  selected?: boolean;
}
