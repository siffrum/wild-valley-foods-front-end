import { Component, Input, OnInit } from '@angular/core';
import { BaseComponent } from '../../../../../../base.component';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CategorySM } from '../../../../../../models/service-models/app/v1/categories-s-m';
import { AdminCategoriesViewModel } from '../../../../../../models/view/Admin/admin.categories.viewmodel';
import { CategoryService } from '../../../../../../services/category.service';
import { CommonService } from '../../../../../../services/common.service';
import { LogHandlerService } from '../../../../../../services/log-handler.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-category-form',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-category-form.html',
  styleUrl: './admin-category-form.scss'
})
export class AdminCategoryForm extends BaseComponent<AdminCategoriesViewModel> implements OnInit {
    protected _logHandler: LogHandlerService;
  @Input() category: CategorySM | null = null;
  form!: FormGroup;
  isSubmitting = false;
  constructor(commonService:CommonService,logHandler:LogHandlerService, private modalService: NgbModal,private categoryService: CategoryService,  public activeModal: NgbActiveModal,
    private fb: FormBuilder,) {
    super(commonService,logHandler);
    this._logHandler = logHandler;
    this.viewModel = new AdminCategoriesViewModel();
  }
  // categories: Category[] = [];
  // filteredCategories: Category[] = [];

  ngOnInit(){

     this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      category_icon: [''],
      slider: [false],
      sequence: [0, [Validators.required, Validators.min(0)]],
      status: ['active', Validators.required]
    });

      if (this.category) {
      this.form.patchValue({
        name: this.category.name,
        description: this.category.description,
        category_icon: this.category.category_icon,
        slider: this.category.slider,
        sequence: this.category.sequence,
        status: this.category.status
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    // this.isSubmitting = true;
    // const formData: CategoryForm = this.form.value;

    // const operation = this.category 
    //   ? this.categoryService.update(this.category.id!, formData)
    //   : this.categoryService.create(formData);

    // operation.subscribe({
    //   next: () => {
    //     this.activeModal.close('saved');
    //     this.isSubmitting = false;
    //   },
    //   error: (err) => {
    //     console.error('Error saving category', err);
    //     this.isSubmitting = false;
    //   }
    // });
  }
}

