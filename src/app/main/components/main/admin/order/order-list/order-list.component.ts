import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../../../../../base.component';
import { CommonService } from '../../../../../../services/common.service';
import { LogHandlerService } from '../../../../../../services/log-handler.service';
import { OrderService } from '../../../../../../services/order.service';
import { CustomerService } from '../../../../../../services/customer.service';
import { ExportService } from '../../../../../../services/export.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PaginationComponent } from '../../../../internal/pagination/pagination.component';
import { OrderViewModel } from '../../../../../../models/view/Admin/order.viewmodel';
import { OrderSM } from '../../../../../../models/service-models/app/v1/order-s-m';
import { CustomerDetailSM } from '../../../../../../models/service-models/app/v1/customer-detail-s-m';

@Component({
  selector: 'app-order-list',
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss',
  standalone: true
})
export class OrderListComponent extends BaseComponent<OrderViewModel> implements OnInit {
  protected _logHandler: LogHandlerService;

  constructor(
    commonService: CommonService,
    logHandler: LogHandlerService,
    private orderService: OrderService,
    private customerService: CustomerService,
    private exportService: ExportService
  ) {
    super(commonService, logHandler);
    this._logHandler = logHandler;
    this.viewModel = new OrderViewModel();
    this.viewModel.pagination.PageSize = 20;
  }

  async ngOnInit() {
    await this.loadCustomers();
    await this.loadOrders();
  }

  async loadCustomers() {
    try {
      // Load all customers for dropdown
      const queryFilter = { skip: 0, top: 1000 };
      const response = await this.customerService.getAllPaginatedCustomer({ 
        pagination: { PageNo: 1, PageSize: 1000, totalCount: 0, totalPages: [] },
        customers: []
      } as any);
      if (!response.isError && response.successData) {
        this.viewModel.customers = response.successData.map((c: CustomerDetailSM) => ({
          id: c.id,
          firstName: c.firstName || '',
          lastName: c.lastName || '',
          fullName: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email || 'Unknown'
        }));
      }
    } catch (error: any) {
      console.error('Error loading customers:', error);
    }
  }

  async loadOrders() {
    try {
      this.viewModel.loading = true;
      this._commonService.presentLoading();
      
      const response = await this.orderService.getAllOrders(this.viewModel);
      
      if (response.isError) {
        this.viewModel.error = response.errorData?.displayMessage || 'Failed to load orders';
        await this._logHandler.logObject(response.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: this.viewModel.error,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } else {
        // Backend returns array of orders
        const orders = Array.isArray(response.successData) ? response.successData : [];
        this.viewModel.orders = orders;
        this.viewModel.totalCount = orders.length;
        this.viewModel.pagination.totalCount = this.viewModel.totalCount;
        this.viewModel.pagination.totalPages = Array.from({ length: Math.ceil(this.viewModel.totalCount / this.viewModel.pagination.PageSize) }, (_, i) => i + 1);
        
        if (orders.length > 0) {
          console.log('Orders loaded successfully:', orders.length, 'orders');
        } else {
          console.log('No orders found');
        }
      }
    } catch (error: any) {
      this.viewModel.error = error.message || 'An error occurred';
      await this._logHandler.logObject(error);
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: this.viewModel.error,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      this.viewModel.loading = false;
      this._commonService.dismissLoader();
    }
  }

  async onPageChange(pageNo: number) {
    this.viewModel.pagination.PageNo = pageNo;
    await this.loadOrders();
  }

  async applyFilters() {
    this.viewModel.pagination.PageNo = 1;
    // Ensure date formats are correct (YYYY-MM-DD)
    if (this.viewModel.filters.startDate && typeof this.viewModel.filters.startDate === 'string') {
      // If date is already in correct format, keep it
      const date = new Date(this.viewModel.filters.startDate);
      if (!isNaN(date.getTime())) {
        this.viewModel.filters.startDate = date.toISOString().split('T')[0];
      }
    }
    if (this.viewModel.filters.endDate && typeof this.viewModel.filters.endDate === 'string') {
      const date = new Date(this.viewModel.filters.endDate);
      if (!isNaN(date.getTime())) {
        this.viewModel.filters.endDate = date.toISOString().split('T')[0];
      }
    }
    await this.loadOrders();
  }

  async clearFilters() {
    this.viewModel.filters = {};
    this.viewModel.pagination.PageNo = 1;
    await this.loadOrders();
  }

  async updateStatus(order: OrderSM, newStatus: string) {
    try {
      this._commonService.presentLoading();
      
      const response = await this.orderService.updateOrderStatus(order.id, newStatus);
      
      if (response.isError) {
        await this._logHandler.logObject(response.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: response.errorData?.displayMessage || 'Failed to update order status',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } else {
        order.status = newStatus;
        this._commonService.showSweetAlertToast({
          title: 'Success',
          text: 'Order status updated successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      }
    } catch (error: any) {
      await this._logHandler.logObject(error);
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: 'An error occurred while updating order status',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      this._commonService.dismissLoader();
    }
  }

  getStatusBadgeClass(status: string): string {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'paid' || statusLower === 'delivered') return 'bg-success';
    if (statusLower === 'shipped' || statusLower === 'processing') return 'bg-warning text-dark';
    if (statusLower === 'failed' || statusLower === 'cancelled') return 'bg-danger';
    if (statusLower === 'created' || statusLower === 'payment_pending') return 'bg-info';
    return 'bg-secondary';
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  formatCurrency(amount: number | undefined): string {
    if (!amount) return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  exportToPDF() {
    const columns = [
      { header: 'Order ID', dataKey: 'id' },
      { header: 'Razorpay Order ID', dataKey: 'razorpayOrderId' },
      { header: 'Customer', dataKey: 'customerName' },
      { header: 'Amount', dataKey: 'amount' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Date', dataKey: 'createdOnUTC' }
    ];

    const data = this.viewModel.orders.map(order => ({
      id: order.id,
      razorpayOrderId: order.razorpayOrderId || 'N/A',
      customerName: `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || order.customer?.email || 'N/A',
      amount: this.formatCurrency(order.amount),
      status: order.status || 'N/A',
      createdOnUTC: this.formatDate(order.createdOnUTC)
    }));

    this.exportService.exportToPDF(data, columns, 'Orders Report', 'orders');
  }

  exportToExcel() {
    const columns = [
      { header: 'Order ID', dataKey: 'id' },
      { header: 'Razorpay Order ID', dataKey: 'razorpayOrderId' },
      { header: 'Customer Name', dataKey: 'customer.firstName' },
      { header: 'Customer Email', dataKey: 'customer.email' },
      { header: 'Amount', dataKey: 'amount' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Date', dataKey: 'createdOnUTC' }
    ];

    const data = this.viewModel.orders.map(order => ({
      ...order,
      amount: order.amount || 0,
      createdOnUTC: order.createdOnUTC ? new Date(order.createdOnUTC).toLocaleDateString('en-IN') : 'N/A'
    }));

    this.exportService.exportToExcel(data, columns, 'orders');
  }
}

