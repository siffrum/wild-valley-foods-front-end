import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseComponent } from '../../../../../../base.component';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CategoriesViewModel } from '../../../../../../models/view/end-user/categories.viewmodel';
import { CategoryService } from '../../../../../../services/category.service';
import { CommonService } from '../../../../../../services/common.service';
import { LogHandlerService } from '../../../../../../services/log-handler.service';
import { CategorySM } from '../../../../../../models/service-models/app/v1/categories-s-m';

@Component({
  selector: 'app-category-form-component',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './category-form-component.html',
  styleUrl: './category-form-component.scss'
})
export class CategoryFormComponent extends BaseComponent<CategoriesViewModel> implements OnInit {
    protected _logHandler: LogHandlerService;
  @Input() category: CategorySM | null = null;
  form!: FormGroup;
  isSubmitting = false;
  constructor(commonService:CommonService,logHandler:LogHandlerService, private modalService: NgbModal,private categoryService: CategoryService,  public activeModal: NgbActiveModal,
    private fb: FormBuilder,) {
    super(commonService,logHandler);
    this._logHandler = logHandler;
    this.viewModel = new CategoriesViewModel();
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
