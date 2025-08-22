// src/app/pages/product-page/product-page.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { switchMap, takeUntil } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
import { ProductSM } from '../../../../../models/service-models/app/v1/product-s-m';
import { ProductService } from '../../../../../services/product.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { log } from 'console';

@Component({
  selector: 'app-product-page',
  templateUrl: './single-product.html',
  styleUrls: ['./single-product.scss'],
  imports: [RouterModule, CommonModule, FormsModule],
})
export class SingleProduct implements OnInit, OnDestroy {
  product = {
    id: 1,
    name: 'Premium Almonds (250g)',
    description:
      'Hand-picked premium almonds. High in protein and perfect for snacking or baking.',
    price: 499.0,
    sku: 'WV-ALM-250',
    stock: 24,
    weight: 250,
    packageDetails: '@50g pouch',
    shippingOptions: { standard: '3-5 days', express: '1-2 days' },
    paymentOptions: { cod: true, online: ['razorpay', 'paypal'] },
    razorpayOrderId: undefined,
    categoryId: 1,
    // local assets or data URLs — product page already supports comma-separated values
    imageBase64: '/assets/logo.png',
    badge: 'Bestseller',
  } as ProductSM;
  loading = false;
  errorMsg = '';
  qty = 1;
  maxQty = 1;
  images: string[] = [];
  selectedImageIndex = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router // used for category navigation / buy now
  ) {}

  ngOnInit(): void {
    this.loading = true;
    const idStr =
      this.route.snapshot.paramMap.get('id') ??
      this.route.snapshot.queryParamMap.get('id');
    if (idStr) {
      const id = parseInt(idStr);
      this.getProductById(id);
    }
  }

  async getProductById(id: number) {
    console.log('Product loaded:', this.product);

    this.loading = false;
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectImage(index: number) {
    if (index >= 0 && index < this.images.length) {
      this.selectedImageIndex = index;
    }
  }

  increment() {
    if (this.qty < this.maxQty) this.qty++;
  }

  decrement() {
    if (this.qty > 1) this.qty--;
  }

  addToCart() {
    // example stub — wire this to your CartService
    // cartService.add({ product: this.product, qty: this.qty })
    if (!this.product) return;
    alert(`${this.qty} x "${this.product.name}" added to cart (stub).`);
  }

  buyNow() {
    // go to checkout with this product
    // for demo, simply navigate to /checkout with state
    if (!this.product) return;
    this.router.navigate(['/checkout'], {
      state: { items: [{ product: this.product, qty: this.qty }] },
    });
  }

  shareProduct() {
    if (!this.product) return;
    const shareData = {
      title: this.product.name,
      text: `${this.product.name} — ${this.product.description ?? ''}`,
      url: window.location.href,
    };
    if ((navigator as any).share) {
      (navigator as any)
        .share(shareData)
        .catch((e: any) => console.warn('Share failed', e));
    } else {
      // fallback copy url
      navigator.clipboard?.writeText(window.location.href);
      alert('Link copied to clipboard');
    }
  }
}
