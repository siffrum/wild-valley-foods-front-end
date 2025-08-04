import { WildValleyFoodsServiceModelBase } from "../base/WildValleyFoods-service-model-base";

export class ProductSM extends WildValleyFoodsServiceModelBase<number>{
  name!: string;
  code?: string ;
  categoryId?: number;
  brandId!: number;
  warehouseId!: number;
  unitId!: number;
  variant!: string;
  quantity!: number;
  price!: number;
  image?: string | null;
  status!: boolean;
}