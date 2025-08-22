import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../../../services/product.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseComponent } from '../../../../../base.component';
import { SingleProductViewModel } from '../../../../../models/view/end-user/product/single-product.viewmodel';
import { CommonService } from '../../../../../services/common.service';
import { LogHandlerService } from '../../../../../services/log-handler.service';

@Component({
  selector: 'app-product-page',
  templateUrl: './single-product.html',
  styleUrls: ['./single-product.scss'],
  imports: [RouterModule, CommonModule, FormsModule],
})
export class SingleProduct
  extends BaseComponent<SingleProductViewModel>
  implements OnInit
{
  constructor(
    commonService: CommonService,
    logHandlerService: LogHandlerService,
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router
  ) {
    super(commonService, logHandlerService);
    this.viewModel = new SingleProductViewModel();
  }

  async ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.getProductById(params['id']);
      }
    });
  }

  async getProductById(id: number) {
    try {
      await this._commonService.presentLoading();
      let resp = await this.productService.getProductById(id);
      await this._commonService.dismissLoader();

      if (resp.isError == false) {
        this.viewModel.product = resp.successData;
      } else {
        this._commonService.showSweetAlert({
          title: 'Error',
          text: resp.errorData?.displayMessage || 'An error occurred',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      this._commonService.dismissLoader();
      await this._exceptionHandler.logObject(error);
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: 'Failed to load product.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  }

  selectImage(index: number) {}

  increment() {
    // if (this.qty < this.maxQty) this.qty++;
  }

  decrement() {
    // if (this.qty > 1) this.qty--;
  }

  addToCart() {
    // example stub — wire this to your CartService
    // cartService.add({ product: this.product, qty: this.qty })
    // if (!this.product) return;
    // alert(`${this.qty} x "${this.product.name}" added to cart (stub).`);
  }

  buyNow() {
    // go to checkout with this product
    // for demo, simply navigate to /checkout with state
    // if (!this.product) return;
    // this.router.navigate(['/checkout'], {
    //   state: { items: [{ product: this.product, qty: this.qty }] },
    // });
  }

  shareProduct() {
    //   if (!this.product) return;
    //   const shareData = {
    //     title: this.product.name,
    //     text: `${this.product.name} — ${this.product.description ?? ''}`,
    //     url: window.location.href,
    //   };
    //   if ((navigator as any).share) {
    //     (navigator as any)
    //       .share(shareData)
    //       .catch((e: any) => console.warn('Share failed', e));
    //   } else {
    //     // fallback copy url
    //     navigator.clipboard?.writeText(window.location.href);
    //     alert('Link copied to clipboard');
    //   }
  }
}
