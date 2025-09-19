import { WildValleyFoodsServiceModelBase } from "../base/WildValleyFoods-service-model-base";

export class CustomerAddressDetailSM extends WildValleyFoodsServiceModelBase<number> {
  customerDetailId!: number;             // reference to CustomerDetail
  addressLine1!: string;
  addressLine2?: string;
  city!: string;
  state!: string;
  postalCode!: string;
  country!: string;
  addressType: "Home" | "Work" | "Other" = "Home";
}