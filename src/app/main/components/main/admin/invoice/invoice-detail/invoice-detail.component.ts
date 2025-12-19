import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BaseComponent } from '../../../../../../base.component';
import { CommonService } from '../../../../../../services/common.service';
import { LogHandlerService } from '../../../../../../services/log-handler.service';
import { InvoiceService } from '../../../../../../services/invoice.service';
import { CommonModule } from '@angular/common';
import { InvoiceSM } from '../../../../../../models/service-models/app/v1/invoice-s-m';

@Component({
  selector: 'app-invoice-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './invoice-detail.component.html',
  styleUrl: './invoice-detail.component.scss',
  standalone: true
})
export class InvoiceDetailComponent extends BaseComponent<any> implements OnInit {
  protected _logHandler: LogHandlerService;
  invoice?: InvoiceSM;
  loading = false;
  error = '';

  constructor(
    commonService: CommonService,
    logHandler: LogHandlerService,
    private invoiceService: InvoiceService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    super(commonService, logHandler);
    this._logHandler = logHandler;
    this.viewModel = {};
  }

  async ngOnInit() {
    const invoiceNumber = this.route.snapshot.paramMap.get('invoiceNumber');
    const orderId = this.route.snapshot.paramMap.get('orderId');
    
    if (invoiceNumber) {
      await this.loadInvoiceByNumber(invoiceNumber);
    } else if (orderId) {
      await this.loadInvoiceByOrderId(parseInt(orderId));
    } else {
      this.error = 'Invalid invoice identifier';
    }
  }

  async loadInvoiceByNumber(invoiceNumber: string) {
    try {
      this.loading = true;
      this._commonService.presentLoading();
      
      const response = await this.invoiceService.getInvoiceByNumber(invoiceNumber);
      
      if (response.isError) {
        this.error = response.errorData?.displayMessage || 'Failed to load invoice';
        await this._logHandler.logObject(response.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: this.error,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } else {
        this.invoice = response.successData;
      }
    } catch (error: any) {
      this.error = error.message || 'An error occurred';
      await this._logHandler.logObject(error);
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: this.error,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      this.loading = false;
      this._commonService.dismissLoader();
    }
  }

  async loadInvoiceByOrderId(orderId: number) {
    try {
      this.loading = true;
      this._commonService.presentLoading();
      
      const response = await this.invoiceService.getInvoiceByOrderId(orderId);
      
      if (response.isError) {
        this.error = response.errorData?.displayMessage || 'Failed to load invoice';
        await this._logHandler.logObject(response.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: this.error,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } else {
        this.invoice = response.successData;
      }
    } catch (error: any) {
      this.error = error.message || 'An error occurred';
      await this._logHandler.logObject(error);
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: this.error,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      this.loading = false;
      this._commonService.dismissLoader();
    }
  }

  printInvoice() {
    window.print();
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  formatCurrency(amount: string | number | undefined): string {
    if (!amount) return '₹0';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₹${num.toLocaleString('en-IN')}`;
  }
}

