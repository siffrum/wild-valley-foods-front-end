import { WildValleyFoodsServiceModelBase } from "../base/WildValleyFoods-service-model-base";
import { VariantLevelSM } from "./variant-level-s-m-enum";

export class VariantSM extends WildValleyFoodsServiceModelBase<number> {            
    name!: string;          
    variantLevel!: VariantLevelSM;  
    variantId?: number;    
  }