import { CommonModule } from '@angular/common';
import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { AdminModule } from "../../../main/admin/admin.module";
import { CategoriesViewModel } from '../../../../../models/view/end-user/product/categories.viewmodel';
import { BaseComponent } from '../../../../../base.component';
import { CommonService } from '../../../../../services/common.service';
import { LogHandlerService } from '../../../../../services/log-handler.service';
import { Router } from '@angular/router';
import { CategoryService } from '../../../../../services/category.service';
import { AdminCategoriesViewModel } from '../../../../../models/view/Admin/admin.categories.viewmodel';

@Component({
  selector: 'app-category',
  templateUrl: './category.html',
  styleUrls: ['./category.scss'],
  imports: [CommonModule, AdminModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryComponent extends BaseComponent<AdminCategoriesViewModel> implements OnInit {
  constructor(
    commonService: CommonService,
    logHandlerService: LogHandlerService,
    private router: Router,
    private categoryService: CategoryService,
  ) {
    super(commonService, logHandlerService);
    this.viewModel = new AdminCategoriesViewModel();
  }

  async ngOnInit() {
   await this.loadPageData();
  }
  @Input() categories: any[] = [];

  trackById(_: number, item: any) {
    return item.id ?? item.name;
  }

   async getAllCategories(): Promise<void> {
    try {
      let resp = await this.categoryService.getAllCategories(
        this.viewModel
      );
      if (resp.isError) {
        await this._exceptionHandler.logObject(resp.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: resp.errorData.displayMessage,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      } else {
        this.viewModel.categories = resp.successData;
      }
    } catch (error) {
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: 'An error occurred',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  }
}
