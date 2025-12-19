import { WildValleyFoodsServiceModelBase } from '../base/WildValleyFoods-service-model-base';
import { OrderRecordSM } from './order-record-s-m';
import { CustomerDetailSM } from './customer-detail-s-m';
import { PaymentSM } from './payment-s-m';

/**
 * Order Status Enum
 */
export enum OrderStatus {
  CREATED = 'created',
  PAID = 'paid',
  FAILED = 'failed',
  FLAGGED = 'flagged',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  PAYMENT_PENDING = 'payment_pending'
}

/**
 * Order Service Model
 */
export class OrderSM extends WildValleyFoodsServiceModelBase<number> {
  razorpayOrderId!: string;
  customerId!: number;
  amount!: number;
  paid_amount!: number;
  due_amount!: number;
  currency!: string;
  status!: OrderStatus | string;
  paymentId?: string;
  signature?: string;
  receipt?: string;
  
  // Relations
  items?: OrderRecordSM[];
  customer?: CustomerDetailSM;
  payments?: PaymentSM[];
  
  // Additional fields from API responses
  customerDetails?: {
    name: string;
    email: string;
    contact: string;
  };
}

