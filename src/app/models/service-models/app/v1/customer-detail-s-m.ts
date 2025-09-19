import { WildValleyFoodsServiceModelBase } from "../base/WildValleyFoods-service-model-base";

export class CustomerDetailSM extends WildValleyFoodsServiceModelBase<number> {
  firstName?: string;
  lastName?: string;
  email!: string;                        // unique, required
  contact?: string;
  razorpayCustomerId?: string;           // Razorpay mapping
  role: "Admin" | "endUser" = "endUser"; // default = endUser
  }