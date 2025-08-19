import { WildValleyFoodsServiceModelBase } from "../base/WildValleyFoods-service-model-base";
import { ProductSM } from "./product-s-m";


export class CategorySM extends WildValleyFoodsServiceModelBase<number> {
  name!: string;
  description!: string;
  category_icon!: string;
  slider!: boolean;
  sequence!: number;
  status!: 'active' | 'inactive';
  products!: ProductSM[];
}
