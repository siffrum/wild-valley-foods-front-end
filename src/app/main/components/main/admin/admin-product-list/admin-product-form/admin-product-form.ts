import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../../../../../../base.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductService } from '../../../../../../services/product.service';
import { CommonService } from '../../../../../../services/common.service';
import { LogHandlerService } from '../../../../../../services/log-handler.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../../../../services/category.service';
import { AdminCategoriesViewModel } from '../../../../../../models/view/Admin/admin.categories.viewmodel';
import { CategorySM } from '../../../../../../models/service-models/app/v1/categories-s-m';
import { ProductSM } from '../../../../../../models/service-models/app/v1/product-s-m';
import { AdminProductsViewModel } from '../../../../../../models/view/Admin/admin-product.viewmodel';
import { UnitsService } from '../../../../../../services/unit.service';
import { UnitsViewModel } from '../../../../../../models/view/end-user/product/units.viewmodel';
import { AdminUnitsViewModel } from '../../../../../../models/view/Admin/admin.units.viewmodel';
import { ProductVariantSM } from '../../../../../../models/service-models/app/v1/variants-s-m';

@Component({
  selector: 'app-admin-product-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-product-form.html',
  styleUrl: './admin-product-form.scss'
})
export class AdminProductForm extends BaseComponent<AdminProductsViewModel> implements OnInit {
  @Input() product: ProductSM | null = null;

  isSubmitting = false;
  selectedFiles: File[] = [];
  protected _logHandler: any;

  constructor(
    commonService: CommonService,
    logHandler: LogHandlerService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private unitService: UnitsService,   
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef
  ) {
    super(commonService, logHandler);
    this._logHandler = logHandler;
    this.viewModel = new AdminProductsViewModel();
  }

  async ngOnInit() {
    // Initialize variants array if not present
    if (!this.viewModel.productFormData.variants) {
      this.viewModel.productFormData.variants = [];
    }
    
    // load categories for dropdown
    await this.loadCategories();
    await this.loadUnits();     // ✅ LOAD UNITS

    if (!this.product) {
      // New product - initialize defaults
      this.viewModel.productFormData.currency = 'INR';
      this.viewModel.productFormData.isBestSelling = false;
      this.viewModel.productFormData.itemId = ''; // Will be auto-generated
      this.addVariant(); // Add first variant
    } else {
      await this.getProductById(this.product.id);
    }
  }

async loadUnits() {
    try {
      this._commonService.presentLoading();
      const unitVm = new AdminUnitsViewModel();
      unitVm.pagination.PageNo = 1;
      unitVm.pagination.PageSize = 50; // fetch all (practical)
      const resp = await this.unitService.getAllPaginatedUnits(unitVm);
      if (resp.isError) {
        await this._logHandler.logObject(resp.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: resp.errorData.displayMessage,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } else {
        this.viewModel.Units = resp.successData || [];
      }
    } catch (error) {
      await this._logHandler.logObject(error);
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: 'Failed to load .',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      this._commonService.dismissLoader();
    }
  }

  /**
   * Auto-generate ItemId from product name
   * Format: Uppercase, remove spaces, special chars -> BASMATIRICE
   */
  generateItemId(): void {
    if (!this.viewModel.productFormData.name) {
      this.viewModel.productFormData.itemId = '';
      return;
    }
    
    // Convert to uppercase, remove spaces and special characters
    let itemId = this.viewModel.productFormData.name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '') // Remove all non-alphanumeric
      .substring(0, 20); // Limit to 20 chars
    
    this.viewModel.productFormData.itemId = itemId;
    
    // Regenerate SKUs for all variants
    if (this.viewModel.productFormData.variants) {
      this.viewModel.productFormData.variants.forEach(v => this.generateSku(v));
    }
  }

  /**
   * Generate SKU for a variant
   * Format: ITEMID-<QTY><UNIT> (e.g., BASMATIRICE-1KG)
   * @param variant - The variant to generate SKU for
   * @param showToast - Whether to show toast notification (default: false for auto-generation)
   */
  generateSku(variant: ProductVariantSM, showToast: boolean = false): void {
    const product = this.viewModel.productFormData;
    
    // Ensure itemId is set
    if (!product.itemId || product.itemId.trim() === '') {
      if (product.name) {
        this.generateItemId();
      } else {
        variant.sku = '';
        if (showToast) {
          this._commonService.ShowToastAtTopEnd('Please enter product name first to generate SKU.', 'warning');
        }
        this.cdr.detectChanges(); // Trigger change detection
        return;
      }
    }
    
    const unit = this.viewModel.Units.find(u => u.id === variant.unitValueId);

    // Validate all required fields for SKU generation
    if (!product.itemId || product.itemId.trim() === '') {
      variant.sku = '';
      if (showToast) {
        this._commonService.ShowToastAtTopEnd('Item ID is missing. Please enter product name.', 'warning');
      }
      this.cdr.detectChanges();
      return;
    }
    
    if (!unit) {
      variant.sku = '';
      if (showToast) {
        this._commonService.ShowToastAtTopEnd('Please select a unit to generate SKU.', 'warning');
      }
      this.cdr.detectChanges();
      return;
    }
    
    if (!variant.quantity || variant.quantity <= 0) {
      variant.sku = '';
      if (showToast) {
        this._commonService.ShowToastAtTopEnd('Please enter a valid quantity (greater than 0) to generate SKU.', 'warning');
      }
      this.cdr.detectChanges();
      return;
    }

    // Format: ITEMID-<QTY><UNIT> (e.g., BASMATIRICE-1KG)
    // Handle decimal quantities properly (e.g., 0.5 -> 05, 1.5 -> 15, 1 -> 1)
    let qty = variant.quantity.toString();
    if (qty.includes('.')) {
      // For decimals, remove the dot (0.5 -> 05, 1.5 -> 15)
      qty = qty.replace('.', '');
    }
    const unitSymbol = (unit.symbol || unit.name || '').toUpperCase().replace(/\s+/g, '');
    variant.sku = `${product.itemId}-${qty}${unitSymbol}`;
    
    // Show success message only if manually triggered
    if (showToast) {
      this._commonService.ShowToastAtTopEnd(`SKU generated: ${variant.sku}`, 'success');
    }
    
    // Trigger change detection to update UI
    this.cdr.detectChanges();
  }

  /**
   * Manually regenerate SKU for a variant (called from button click)
   */
  regenerateSku(variant: ProductVariantSM): void {
    this.generateSku(variant, true);
  }

  /**
   * Called when unit dropdown changes
   */
  onUnitChange(variant: ProductVariantSM): void {
    this.generateSku(variant);
    this.cdr.detectChanges();
  }

  /**
   * Called when quantity input changes
   */
  onQuantityChange(variant: ProductVariantSM): void {
    this.generateSku(variant);
    this.cdr.detectChanges();
  }

  /**
   * Get missing fields for a variant (helper for error messages)
   */
  private getMissingFieldsForVariant(v: any): string {
    const missingFields = [];
    if (!this.viewModel.productFormData.itemId) missingFields.push('Item ID');
    if (!v.unitValueId) missingFields.push('Unit');
    if (!v.quantity || v.quantity <= 0) missingFields.push('Quantity');
    if (!v.price || v.price <= 0) missingFields.push('Price');
    if (v.stock === undefined || v.stock < 0) missingFields.push('Stock');
    return missingFields.length > 0 ? missingFields.join(', ') : 'Unknown fields';
  }

  /**
   * Check if form can be submitted (simpler check for button enablement)
   * This is more lenient than isFormValid - only checks essential fields
   */
  canSubmitForm(): boolean {
    // Basic checks
    if (!this.viewModel.productFormData.name?.trim()) return false;
    if (!this.viewModel.productFormData.categoryId) return false;
    if (!this.viewModel.productFormData.variants?.length) return false;

    // Ensure ItemId exists (generate if needed)
    if (!this.viewModel.productFormData.itemId?.trim()) {
      if (this.viewModel.productFormData.name) {
        this.generateItemId();
      } else {
        return false;
      }
    }

    // Check each variant has minimum required fields
    for (const v of this.viewModel.productFormData.variants) {
      if (!v.unitValueId) return false;
      
      // Convert to numbers for comparison (inputs may return strings)
      const quantity = Number(v.quantity);
      const price = Number(v.price);
      
      if (isNaN(quantity) || quantity <= 0) return false;
      if (isNaN(price) || price <= 0) return false;
      
      // Stock defaults to 0 if not set
      if (v.stock === undefined || v.stock === null) {
        v.stock = 0;
      }
      
      // Try to generate SKU if missing (but don't fail if it can't be generated yet)
      if ((!v.sku || v.sku.trim() === '') && 
          this.viewModel.productFormData.itemId && 
          v.unitValueId && 
          quantity > 0) {
        this.generateSku(v);
      }
    }

    return true;
  }

  /**
   * Get validation message for tooltip
   */
  getValidationMessage(): string {
    if (!this.viewModel.productFormData.name?.trim()) return 'Please enter product name';
    if (!this.viewModel.productFormData.categoryId) return 'Please select a category';
    if (!this.viewModel.productFormData.variants?.length) return 'Please add at least one variant';
    
    for (let i = 0; i < this.viewModel.productFormData.variants.length; i++) {
      const v = this.viewModel.productFormData.variants[i];
      if (!v.unitValueId) return `Variant #${i + 1}: Please select a unit`;
      
      const quantity = Number(v.quantity);
      const price = Number(v.price);
      
      if (isNaN(quantity) || quantity <= 0) return `Variant #${i + 1}: Please enter quantity > 0`;
      if (isNaN(price) || price <= 0) return `Variant #${i + 1}: Please enter price > 0`;
    }
    
    return 'Please fill all required fields';
  }
isVariantInvalid(v: any): boolean {
  // Required fields validation with proper number conversion
  if (!v.unitValueId) return true;
  
  const quantity = Number(v.quantity);
  const price = Number(v.price);
  const stock = v.stock !== undefined && v.stock !== null ? Number(v.stock) : 0;
  
  if (isNaN(quantity) || quantity <= 0) return true;
  if (isNaN(price) || price <= 0) return true;
  if (isNaN(stock) || stock < 0) return true;
  
  // SKU validation - only required for submission, not for UI validation
  // if (!v.sku || v.sku.trim() === '') return true;
  
  // Compare price validation
  if (v.comparePrice) {
    const comparePrice = Number(v.comparePrice);
    if (!isNaN(comparePrice) && comparePrice <= price) return true;
  }
  
  return false;
}

/**
 * Check if form is valid (including custom validations)
 * This is called by the template to enable/disable the submit button
 * Note: This is a "soft" validation - strict validation happens in onSubmit()
 * We check if required fields are filled, not if SKU exists (it will be generated)
 */
isFormValid(): boolean {
  try {
    // Check basic form validity
    if (!this.viewModel.productFormData.name || this.viewModel.productFormData.name.trim() === '') {
      return false;
    }

    if (!this.viewModel.productFormData.categoryId) {
      return false;
    }

    // Check variants exist
    if (!this.viewModel.productFormData.variants || this.viewModel.productFormData.variants.length === 0) {
      return false;
    }

    // Generate ItemId if missing (needed for SKU generation)
    if (!this.viewModel.productFormData.itemId || this.viewModel.productFormData.itemId.trim() === '') {
      if (this.viewModel.productFormData.name) {
        this.generateItemId();
      } else {
        return false;
      }
    }

    // Ensure stock is set for all variants (default to 0)
    this.viewModel.productFormData.variants.forEach(v => {
      if (v.stock === undefined || v.stock === null) {
        v.stock = 0;
      }
    });

    // Try to generate SKU for all variants (if not already generated and required fields are present)
    this.viewModel.productFormData.variants.forEach(v => {
      // Only generate if SKU is missing and all required fields are present
      if ((!v.sku || v.sku.trim() === '') && 
          this.viewModel.productFormData.itemId && 
          v.unitValueId && 
          v.quantity && v.quantity > 0) {
        this.generateSku(v);
      }
    });

    // Check if all variants have basic required fields filled
    // We don't require SKU to exist here - it will be generated in onSubmit if needed
    for (const v of this.viewModel.productFormData.variants) {
      // Check required fields with proper number conversion
      if (!v.unitValueId) {
        return false;
      }
      
      const quantity = Number(v.quantity);
      const price = Number(v.price);
      const stock = v.stock !== undefined && v.stock !== null ? Number(v.stock) : 0;
      
      if (isNaN(quantity) || quantity <= 0) {
        return false;
      }
      if (isNaN(price) || price <= 0) {
        return false;
      }
      if (isNaN(stock) || stock < 0) {
        return false;
      }
      
      // For SKU: Check if it CAN be generated (all required fields present)
      // We don't require SKU to exist yet - it will be auto-generated in onSubmit
      // Just verify we have everything needed: itemId, unitValueId, quantity
      if (!this.viewModel.productFormData.itemId || !v.unitValueId || isNaN(quantity) || quantity <= 0) {
        return false;
      }
      
      // Compare price validation (if provided, must be > price)
      if (v.comparePrice) {
        const comparePrice = Number(v.comparePrice);
        if (!isNaN(comparePrice) && comparePrice > 0 && comparePrice <= price) {
          return false;
        }
      }
    }

    // Images check - allow button to be enabled even if images not selected yet
    // Strict validation will happen in onSubmit()
    
    return true;
  } catch (error) {
    console.error('Error in isFormValid:', error);
    return false;
  }
}
  async loadCategories() {
    try {
      this._commonService.presentLoading();
      const catVm = new AdminCategoriesViewModel();
      catVm.pagination.PageNo = 1;
      catVm.pagination.PageSize = 50; // fetch all (practical)
      const resp = await this.categoryService.getAllCategories(catVm);
      if (resp.isError) {
        await this._logHandler.logObject(resp.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: resp.errorData.displayMessage,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } else {
        this.viewModel.categories = resp.successData || [];
      }
    } catch (error) {
      await this._logHandler.logObject(error);
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: 'Failed to load categories.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      this._commonService.dismissLoader();
    }
  }

  onFileChange(event: any): void {
    const files = event.target.files;
    if (files && files.length) {
      this.selectedFiles = Array.from(files);
    }
  }

  hasImages(): boolean {
    // used for validation: either existing images present or user selected new files (create needs images)
    const existing = !!(this.viewModel.productFormData.images && this.viewModel.productFormData.images.length > 0);
    return this.selectedFiles.length > 0 || existing;
  }

  async onSubmit(form: any): Promise<void> {
    this.viewModel.FormSubmitted = true;
    if (form.invalid) {
      this._commonService.ShowToastAtTopEnd('Please fill all required fields.', 'error');
      return;
    }

    // Validate variants exist
    if (!this.viewModel.productFormData.variants || this.viewModel.productFormData.variants.length === 0) {
      this._commonService.showSweetAlertToast({
        title: 'Validation Error',
        text: 'At least one product variant is required.',
        icon: 'warning'
      });
      return;
    }

    // CRITICAL: Generate ItemId first if missing
    if (!this.viewModel.productFormData.itemId || this.viewModel.productFormData.itemId.trim() === '') {
      if (this.viewModel.productFormData.name) {
        this.generateItemId();
      } else {
        this._commonService.showSweetAlertToast({
          title: 'Validation Error',
          text: 'Product name is required to generate Item ID and SKU.',
          icon: 'warning'
        });
        return;
      }
    }

    // STEP 2: Ensure stock is set (default to 0 if undefined) BEFORE SKU generation
    this.viewModel.productFormData.variants.forEach(v => {
      if (v.stock === undefined || v.stock === null) {
        v.stock = 0;
      }
    });

    // STEP 3: CRITICAL - Generate SKU for all variants BEFORE validation
    // This ensures SKU is always present even if user didn't change unit/quantity
    let skuGenerationFailed = false;
    let failedVariantIndex = -1;
    
    for (let index = 0; index < this.viewModel.productFormData.variants.length; index++) {
      const v = this.viewModel.productFormData.variants[index];
      
      // Generate SKU for this variant
      this.generateSku(v);
      
      // Check if SKU generation failed
      if (!v.sku || v.sku.trim() === '') {
        skuGenerationFailed = true;
        failedVariantIndex = index;
        
        // Try to identify what's missing
        let missingFields = [];
        if (!this.viewModel.productFormData.itemId) missingFields.push('Item ID');
        if (!v.unitValueId) missingFields.push('Unit');
        if (!v.quantity || v.quantity <= 0) missingFields.push('Quantity');
        
        break; // Exit loop on first failure
      }
    }

    if (skuGenerationFailed) {
      this._commonService.showSweetAlertToast({
        title: 'Validation Error',
        text: `Variant #${failedVariantIndex + 1}: SKU could not be generated. Missing: ${this.getMissingFieldsForVariant(this.viewModel.productFormData.variants[failedVariantIndex])}. Please fill all required fields.`,
        icon: 'warning'
      });
      return;
    }

    // Now validate variants after SKU generation
    const invalidVariant = this.viewModel.productFormData.variants.some(v => this.isVariantInvalid(v));
    if (invalidVariant) {
      // Find which variant is invalid and why
      const invalidVariants = this.viewModel.productFormData.variants
        .map((v, i) => ({ variant: v, index: i }))
        .filter(({ variant }) => this.isVariantInvalid(variant));
      
      const errorMessages = invalidVariants.map(({ variant, index }) => {
        const issues = [];
        if (!variant.unitValueId) issues.push('Unit');
        if (!variant.quantity || variant.quantity <= 0) issues.push('Quantity');
        if (!variant.price || variant.price <= 0) issues.push('Price');
        if (!variant.sku || variant.sku.trim() === '') issues.push('SKU');
        if (variant.stock === undefined || variant.stock < 0) issues.push('Stock');
        return `Variant #${index + 1}: ${issues.join(', ')}`;
      });
      
      this._commonService.showSweetAlertToast({
        title: 'Validation Error',
        text: `Please fix variant fields:\n${errorMessages.join('\n')}`,
        icon: 'warning'
      });
      return;
    }

    // Ensure at least one default variant
    const hasDefault = this.viewModel.productFormData.variants.some(v => v.isDefaultVariant);
    if (!hasDefault) {
      // Set first variant as default
      this.viewModel.productFormData.variants[0].isDefaultVariant = true;
    }

    if (!this.hasImages()) {
      this._commonService.ShowToastAtTopEnd('Please select at least one product image.', 'error');
      return;
    }

    this.isSubmitting = true;
    try {
      if (this.product && this.product.id) {
        await this.updateProduct();
      } else {
        await this.addProduct();
      }
    } finally {
      this.isSubmitting = false;
    }
  }
addVariant() {
  // Ensure variants array exists
  if (!this.viewModel.productFormData.variants) {
    this.viewModel.productFormData.variants = [];
  }
  
  // Create a new variant with default values
  const newVariant: ProductVariantSM = {
    id: 0, // New variant, will be assigned by backend
    productId: this.viewModel.productFormData.id || 0,
    unitValueId: undefined, // Will be selected from dropdown
    quantity: 1,
    weight: 0,
    price: 0,
    comparePrice: undefined,
    sku: '',
    barcode: undefined,
    stock: 0,
    isDefaultVariant: this.viewModel.productFormData.variants.length === 0, // First variant is default
    isActive: true,
  } as ProductVariantSM;
  
  this.viewModel.productFormData.variants.push(newVariant);
}

removeVariant(index: number) {
  this.viewModel.productFormData.variants.splice(index, 1);
}

setDefaultVariant(index: number) {
  this.viewModel.productFormData.variants.forEach((v, i) => {
    v.isDefaultVariant = i === index;
  });
}
  private async addProduct() {
    try {
      this._commonService.presentLoading();
      
      // Ensure ItemId is set (should be auto-generated, but double-check)
      if (!this.viewModel.productFormData.itemId || this.viewModel.productFormData.itemId.trim() === '') {
        this.generateItemId();
      }
      
      // Final SKU generation pass (ensure all SKUs are set)
      this.viewModel.productFormData.variants.forEach(v => {
        this.generateSku(v);
      });
      
      // Prepare product data for backend (ensure variants have correct structure)
      const productData = {
        name: this.viewModel.productFormData.name,
        description: this.viewModel.productFormData.description || null,
        richDescription: this.viewModel.productFormData.richDescription || null,
        itemId: this.viewModel.productFormData.itemId,
        currency: this.viewModel.productFormData.currency || 'INR',
        isBestSelling: this.viewModel.productFormData.isBestSelling || false,
        hsnCode: this.viewModel.productFormData.hsnCode || null,
        taxRate: this.viewModel.productFormData.taxRate || null,
        categoryId: this.viewModel.productFormData.categoryId,
        variants: this.viewModel.productFormData.variants.map(v => {
          // Validate required fields before mapping
          if (!v.unitValueId || !v.quantity || !v.price || !v.sku) {
            console.error('Invalid variant:', v);
            throw new Error(`Variant is missing required fields: unitValueId=${v.unitValueId}, quantity=${v.quantity}, price=${v.price}, sku=${v.sku}`);
          }
          
          return {
            unitValueId: v.unitValueId, // Backend expects unitValueId
            quantity: Number(v.quantity),
            weight: v.weight ? Number(v.weight) : null, // Weight per variant
            price: Number(v.price),
            comparePrice: v.comparePrice ? Number(v.comparePrice) : null,
            sku: v.sku.trim(), // Ensure SKU is trimmed and present
            barcode: v.barcode ? v.barcode.trim() : null,
            stock: Number(v.stock || 0),
            isDefaultVariant: v.isDefaultVariant || false,
            isActive: v.isActive !== undefined ? v.isActive : true,
          };
        })
      };
      
      // Debug log to verify payload
      console.log('Product Data being sent:', JSON.stringify(productData, null, 2));
      
      const formData = new FormData();
      formData.append('reqData', JSON.stringify(productData));
      for (const f of this.selectedFiles) {
        formData.append('images', f);
      }

      const resp = await this.productService.addProduct(formData);
      if (resp.isError) {
        await this._logHandler.logObject(resp.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: resp.errorData.displayMessage,
          icon: 'error'
        });
      } else {
        this._commonService.showSweetAlertToast({
          title: 'Success',
          text: 'Product added successfully.',
          icon: 'success'
        });
        this.activeModal.close('saved');
      }
    } catch (error) {
      await this._logHandler.logObject(error);
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: 'Failed to add product.',
        icon: 'error'
      });
    } finally {
      this._commonService.dismissLoader();
    }
  }

  private async updateProduct() {
    try {
      this._commonService.presentLoading();
      
      // Ensure ItemId is set
      if (!this.viewModel.productFormData.itemId || this.viewModel.productFormData.itemId.trim() === '') {
        this.generateItemId();
      }
      
      // Final SKU generation pass (ensure all SKUs are set)
      this.viewModel.productFormData.variants.forEach(v => {
        this.generateSku(v);
      });
      
      // Prepare product data for backend (ensure variants have correct structure)
      const productData = {
        name: this.viewModel.productFormData.name,
        description: this.viewModel.productFormData.description || null,
        richDescription: this.viewModel.productFormData.richDescription || null,
        itemId: this.viewModel.productFormData.itemId,
        currency: this.viewModel.productFormData.currency || 'INR',
        isBestSelling: this.viewModel.productFormData.isBestSelling || false,
        hsnCode: this.viewModel.productFormData.hsnCode || null,
        taxRate: this.viewModel.productFormData.taxRate || null,
        categoryId: this.viewModel.productFormData.categoryId,
        variants: this.viewModel.productFormData.variants.map(v => {
          // For existing variants, validate required fields
          if (v.id) {
            // Existing variant - all fields should be present
            if (!v.unitValueId || !v.quantity || !v.price || !v.sku) {
              console.error('Invalid existing variant:', v);
              throw new Error(`Existing variant is missing required fields: unitValueId=${v.unitValueId}, quantity=${v.quantity}, price=${v.price}, sku=${v.sku}`);
            }
          } else {
            // New variant - validate all required fields
            if (!v.unitValueId || !v.quantity || !v.price || !v.sku) {
              console.error('Invalid new variant:', v);
              throw new Error(`New variant is missing required fields: unitValueId=${v.unitValueId}, quantity=${v.quantity}, price=${v.price}, sku=${v.sku}`);
            }
          }
          
          return {
            id: v.id || undefined, // Include ID for existing variants, undefined for new ones
            unitValueId: v.unitValueId, // Backend expects unitValueId
            quantity: Number(v.quantity),
            weight: v.weight ? Number(v.weight) : null, // Weight per variant
            price: Number(v.price),
            comparePrice: v.comparePrice ? Number(v.comparePrice) : null,
            sku: v.sku.trim(), // Ensure SKU is trimmed and present
            barcode: v.barcode ? v.barcode.trim() : null,
            stock: Number(v.stock || 0),
            isDefaultVariant: v.isDefaultVariant || false,
            isActive: v.isActive !== undefined ? v.isActive : true,
          };
        })
      };
      
      // Debug log to verify payload
      console.log('Product Data being sent (update):', JSON.stringify(productData, null, 2));
      
      const formData = new FormData();
      formData.append('reqData', JSON.stringify(productData));
      // if new files selected -> append them (server will replace existing)
      for (const f of this.selectedFiles) {
        formData.append('images', f);
      }

      const resp = await this.productService.updateProduct(formData, this.viewModel.productFormData.id);
      if (resp.isError) {
        await this._logHandler.logObject(resp.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: resp.errorData.displayMessage,
          icon: 'error'
        });
      } else {
        this._commonService.showSweetAlertToast({
          title: 'Success',
          text: 'Product updated successfully.',
          icon: 'success'
        });
        this.activeModal.close('saved');
      }
    } catch (error) {
      await this._logHandler.logObject(error);
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: 'Failed to update product.',
        icon: 'error'
      });
    } finally {
      this._commonService.dismissLoader();
    }
  }

  private async getProductById(id: number) {
    try {
      this._commonService.presentLoading();
      const resp = await this.productService.getProductById(id);
      if (resp.isError) {
        await this._logHandler.logObject(resp.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: resp.errorData.displayMessage,
          icon: 'error'
        });
      } else {
        this.viewModel.productFormData = resp.successData;
        
        // REFACTOR: Map variants to ensure unitValueId is set (from unitId or unitValue relation)
        if (this.viewModel.productFormData.variants && this.viewModel.productFormData.variants.length > 0) {
          this.viewModel.productFormData.variants = this.viewModel.productFormData.variants.map((v: any) => {
            // Ensure unitValueId is set (may come as unitId or from unitValue relation)
            if (!v.unitValueId) {
              if (v.unitId) {
                v.unitValueId = v.unitId;
              } else if (v.unitValue?.id) {
                v.unitValueId = v.unitValue.id;
              }
            }
            // Ensure stock is set
            if (v.stock === undefined || v.stock === null) {
              v.stock = 0;
            }
            return v;
          });
        }
        
        // Note: existing images are available in viewModel.productFormData.images (server returned base64 strings)
      }
    } catch (error) {
      await this._logHandler.logObject(error);
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: 'Failed to load product details.',
        icon: 'error'
      });
    } finally {
      this._commonService.dismissLoader();
    }
  }
}
