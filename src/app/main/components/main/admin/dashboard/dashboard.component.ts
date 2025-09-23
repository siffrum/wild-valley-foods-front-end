import { Component } from '@angular/core';
import { BaseComponent } from '../../../../../base.component';
import { CommonService } from '../../../../../services/common.service';
import { LogHandlerService } from '../../../../../services/log-handler.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [BaseChartDirective,CommonModule]
})
export class DashboardComponent extends BaseComponent<any> {
  constructor(commonService:CommonService,logHandler:LogHandlerService) {
    super(commonService,logHandler);
    this.viewModel = {};

  }

  ngOnInit(){
    this._commonService.dismissLoader();
  }


  // KPI Data
  public totalSales = '$120,000';
  public totalOrders = 756;
  public activeUsers = 3421;
  public returnRate = '2.3%';

  // Monthly Sales Bar Chart
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: { x: {}, y: { beginAtZero: true } },
    plugins: {
      legend: { display: true },
      title: { display: true, text: 'Monthly Sales ($)', font: { size: 20 } }
    }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{ data: [3500, 4200, 2800, 5000, 4300, 6100], label: 'Sales' }]
  };

  // Product Category Pie Chart
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'right' },
      title: { display: true, text: 'Product Category Shares', font: { size: 18 } },
    }
  };
  public pieChartType: ChartType = 'pie';
  public pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Dry fruits', 'Spices', 'Beauty Products', 'Shilajit', 'Oils'],
    datasets: [{
      data: [35, 25, 20, 10, 10],
      backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b']
    }]
  };

  // Daily Visitors Line Chart
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: { display: true, title: { display: true, text: 'Day of Month' } },
      y: { beginAtZero: true, title: { display: true, text: 'Visitors' } }
    },
    plugins: {
      legend: { display: true },
      title: { display: true, text: 'Daily Website Visitors', font: { size: 18 } }
    }
  };
  public lineChartType: ChartType = 'line';
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
    datasets: [
      {
        label: 'Website Visitors',
        data: [120, 135, 110, 160, 175, 190, 210, 240, 230, 220, 200, 180, 170, 160, 150, 140, 130, 135, 145, 155, 167, 180, 190, 200, 210, 195, 185, 180, 175, 160],
        borderColor: '#4e73df',
        backgroundColor: 'rgba(78,115,223,0.1)',
        fill: true,
        tension: 0.3
      }
    ]
  };

  // Extra widget data - page visits & user time spent (dummy)
  public topPages = [
    { page: 'Home', visits: 1200, avgTime: '2m 30s' },
    { page: 'Product Detail', visits: 900, avgTime: '3m 10s' },
    { page: 'Categories', visits: 600, avgTime: '1m 45s' },
    { page: 'Checkout', visits: 300, avgTime: '4m 10s' },
  ];
  
  // Recent Orders & Top Products for widgets
  public recentOrders = [
    'Order #1234 - $120 - Delivered',
    'Order #1235 - $250 - Processing',
    'Order #1236 - $75 - Shipped',
    'Order #1237 - $180 - Delivered'
  ];

  public topProducts = ['Saffron', 'Honey', 'Walnuts', 'Almonds', 'Olive Oil'];  
}

