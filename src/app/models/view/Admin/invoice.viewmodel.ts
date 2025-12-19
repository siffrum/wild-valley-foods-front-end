import { BaseViewModel } from '../../internal/base.viewmodel';
import { InvoiceSM } from '../../service-models/app/v1/invoice-s-m';

export class InvoiceViewModel extends BaseViewModel {
  invoices: InvoiceSM[] = [];
  selectedInvoice?: InvoiceSM;
  
  filters: {
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {};
  
  loading = false;
  error = '';
  totalCount = 0;
}

