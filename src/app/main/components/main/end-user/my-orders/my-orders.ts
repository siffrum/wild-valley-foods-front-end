import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

interface OrderItem {
  id: string;
  name: string;
  variant?: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: number | string;
  date: string; // ISO
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  shippingMethod?: string;
  paymentMethod?: string;
  tracking?: string | null;
  showDetails?: boolean;
  selected?: boolean;
}

@Component({
  selector: 'app-orders',
  templateUrl: './my-orders.html',
  styleUrls: ['./my-orders.scss'],
  imports: [CommonModule,FormsModule],
})
export class MyOrders implements OnInit {
  orders: Order[] = [];
  isLoading = true;

  // UI state
  searchTerm = '';
  statusFilter: '' | OrderStatus = '';
  sortBy: 'dateDesc' | 'dateAsc' | 'totalDesc' | 'totalAsc' = 'dateDesc';

  // pagination
  page = 1;
  pageSize = 5;

  constructor() {}

  ngOnInit(): void {
    // simulate loading then load from localStorage or sample data
    setTimeout(() => {
      const raw = localStorage.getItem('my_orders_v1');
      if (raw) {
        try { this.orders = JSON.parse(raw); }
        catch { this.orders = []; }
      } else {
        this.orders = this.buildSample();
      }
      this.isLoading = false;
    }, 350);
  }

  /* ---------------- dummy data ---------------- */
  buildSample(): Order[] {
    const now = new Date();
    const sample: Order[] = [
      {
        id: 1001,
        date: new Date(now.getTime() - 1000*60*60*24*2).toISOString(),
        status: 'Delivered',
        items: [
          { id: 'a1', name: 'Minimal Leather Wallet', variant: 'Brown', quantity: 1, price: 1299, image: 'https://picsum.photos/seed/w1/160/160' },
          { id: 'a2', name: 'Ceramic Coffee Mug', variant: 'Matte Black', quantity: 2, price: 499, image: 'https://picsum.photos/seed/w6/160/160' }
        ],
        subtotal: 1299 + 2*499,
        discount: 100,
        shipping: 49,
        total: 1299 + 2*499 - 100 + 49,
        shippingMethod: 'Standard (3–5 days)',
        paymentMethod: 'Card •••• 4242',
        tracking: 'TRK123456789'
      },
      {
        id: 1002,
        date: new Date(now.getTime() - 1000*60*60*24*5).toISOString(),
        status: 'Processing',
        items: [
          { id: 'b1', name: 'Wireless Earbuds Pro', variant: 'White', quantity: 1, price: 3999, image: 'https://picsum.photos/seed/w2/160/160' }
        ],
        subtotal: 3999,
        discount: 199,
        shipping: 0,
        total: 3999 - 199,
        shippingMethod: 'Express (1–2 days)',
        paymentMethod: 'UPI',
        tracking: null
      },
      {
        id: 1003,
        date: new Date(now.getTime() - 1000*60*60*24*14).toISOString(),
        status: 'Cancelled',
        items: [
          { id: 'c1', name: 'Classic Denim Jacket', variant: 'Large', quantity: 1, price: 2499, image: 'https://picsum.photos/seed/w3/160/160' }
        ],
        subtotal: 2499,
        discount: 0,
        shipping: 0,
        total: 2499,
        shippingMethod: 'Standard',
        paymentMethod: 'Card •••• 1111',
        tracking: null
      },
      {
        id: 1004,
        date: new Date(now.getTime() - 1000*60*60*24*20).toISOString(),
        status: 'Shipped',
        items: [
          { id: 'd1', name: 'Travel Backpack 35L', variant: 'Navy', quantity: 1, price: 3299, image: 'https://picsum.photos/seed/w5/160/160' },
          { id: 'd2', name: 'Noise-Isolating Headphones', variant: 'Black', quantity: 1, price: 5499, image: 'https://picsum.photos/seed/w7/160/160' }
        ],
        subtotal: 3299 + 5499,
        discount: 500,
        shipping: 99,
        total: 3299 + 5499 - 500 + 99,
        shippingMethod: 'Standard (3–5 days)',
        paymentMethod: 'COD',
        tracking: 'TRK987654321'
      },
      {
        id: 1005,
        date: new Date(now.getTime() - 1000*60*60*24*1).toISOString(),
        status: 'Processing',
        items: [
          { id: 'e1', name: 'Smartwatch 2.0', variant: 'Black', quantity: 1, price: 8999, image: 'https://picsum.photos/seed/w4/160/160' }
        ],
        subtotal: 8999,
        discount: 0,
        shipping: 0,
        total: 8999,
        shippingMethod: 'Express',
        paymentMethod: 'Card •••• 2222',
        tracking: null
      }
    ];

    // persist sample
    localStorage.setItem('my_orders_v1', JSON.stringify(sample));
    return sample;
  }

  loadSample() {
    this.orders = this.buildSample();
    this.page = 1;
  }

  clearAll() {
    localStorage.removeItem('my_orders_v1');
    this.orders = [];
  }

  /* -------------- computed lists ---------------- */
  get filteredOrders(): Order[] {
    let arr = [...this.orders];
    if (this.searchTerm && this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      arr = arr.filter(o =>
        String(o.id).toLowerCase().includes(q) ||
        o.items.some(it => it.name.toLowerCase().includes(q)) ||
        (o.paymentMethod || '').toLowerCase().includes(q)
      );
    }
    if (this.statusFilter) {
      arr = arr.filter(o => o.status === this.statusFilter);
    }
    switch (this.sortBy) {
      case 'dateAsc': arr.sort((a,b) => +new Date(a.date) - +new Date(b.date)); break;
      case 'dateDesc': arr.sort((a,b) => +new Date(b.date) - +new Date(a.date)); break;
      case 'totalAsc': arr.sort((a,b) => a.total - b.total); break;
      case 'totalDesc': arr.sort((a,b) => b.total - a.total); break;
    }
    return arr;
  }

  get pagedOrders(): Order[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredOrders.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredOrders.length / this.pageSize));
  }

  get totalCount(): number {
    return this.orders.length;
  }

  /* --------------- actions ------------------ */
  setFilter(status: '' | OrderStatus) {
    this.statusFilter = status;
    this.page = 1;
  }

  toggleDetails(order: Order) {
    order.showDetails = !order.showDetails;
  }

  statusClass(status: OrderStatus) {
    return status;
  }

  onSelectionChange() {
    // keep for future: bulk operations
  }

  prevPage() {
    if (this.page > 1) this.page--;
  }
  nextPage() {
    if (this.page < this.totalPages) this.page++;
  }

  downloadInvoice(order: Order) {
    const invoice = {
      orderId: order.id,
      date: order.date,
      items: order.items,
      subtotal: order.subtotal,
      discount: order.discount,
      shipping: order.shipping,
      total: order.total,
      payment: order.paymentMethod
    };
    const blob = new Blob([JSON.stringify(invoice, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_order_${order.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  reorder(order: Order) {
    // placeholder: wire up to cart service
    alert(`Reorder placed for order #${order.id} (demo).`);
  }
}
