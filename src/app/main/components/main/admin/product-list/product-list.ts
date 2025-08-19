import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductComponentViewModel } from '../../../../../models/view/end-user/product/product-component.viewmodel';
import { BaseComponent } from '../../../../../base.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CategoryService } from '../../../../../services/category.service';
import { CommonService } from '../../../../../services/common.service';
import { LogHandlerService } from '../../../../../services/log-handler.service';
import { ProductService } from '../../../../../services/product.service';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule,],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductList  extends BaseComponent<ProductComponentViewModel> implements OnInit {
    protected _logHandler: LogHandlerService;
  constructor(commonService:CommonService,logHandler:LogHandlerService, private modalService: NgbModal,private categoryService: CategoryService,private productService: ProductService,) {
    super(commonService,logHandler);
    this._logHandler = logHandler;
    this.viewModel = new ProductComponentViewModel();
  }
  // categories: Category[] = [];
  // filteredCategories: Category[] = [];

  ngOnInit(){
  }

  async loadProducts() {
    try {
      this._commonService.presentLoading();
      let resp = await this.productService.getAllProducts(this.viewModel);
      if (resp.isError) {
        await this._logHandler.logObject(resp.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: resp.errorData.displayMessage,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      } else {
        this.viewModel.products = resp.successData;
        console.log('Products loaded:', this.viewModel.products);
        this.viewModel.filteredProducts = [...resp.successData];
        // this.sortData();
        // this.TotalProductCount();
      }
    } catch (error) {
      await this._logHandler.logObject(error);
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: 'Failed to load products.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } finally {
      this._commonService.dismissLoader();
    }
  }
}
