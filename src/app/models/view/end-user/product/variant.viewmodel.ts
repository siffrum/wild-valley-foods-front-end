import { BaseViewModel } from "../../../internal/base.viewmodel";
import { VariantsSM } from "../../../service-models/app/v1/variants-s-m";

export class VariantViewModel extends BaseViewModel{
     updateMode: boolean = false;
     variants: VariantsSM[] = []
    variant:VariantsSM=new VariantsSM()
}