import { WildValleyFoodsServiceModelBase } from '../base/WildValleyFoods-service-model-base';
import { ProductVariantSM } from './variants-s-m';
import { CategorySM } from './categories-s-m';

/**
 * Stock Status Enum for UI display
 */
export enum StockStatus {
  IN_STOCK = 'In Stock',
  LOW_STOCK = 'Low Stock',
  OUT_OF_STOCK = 'Out of Stock'
}

/**
 * Low stock threshold (items below this are considered low stock)
 */
const LOW_STOCK_THRESHOLD = 5;

/**
 * Product Service Model
 * 
 * REFACTOR: Removed deprecated fields (price, stock, sku) - now live on variants
 * All pricing and stock logic must use selectedVariant
 * Product is a container, Variant is the sellable entity
 */
export class ProductSM extends WildValleyFoodsServiceModelBase<number> {
  name!: string;
  description!: string;
  richDescription?: string;
  itemId!: string;
  images?: string[]; // e.g. ["data:image/png;base64,...", ...]
  currency!: string;
  isBestSelling!: boolean;
  hsnCode!: string;
  taxRate!: number;
  categoryId!: number;
  category?: CategorySM;  // Category relation (from backend)
  variants: ProductVariantSM[] = [];
  
  // Review summary (from backend)
  averageRating: number = 0;
  reviewCount: number = 0;
  
  // UI state fields
  selectedVariantId?: number;    // currently selected variant ID
  isWishlisted: boolean = false;
  cartQuantity: number = 1;
  isInCart: boolean = false;
  
  // Helper: Get default variant (auto-selected on load)
  get defaultVariant(): ProductVariantSM | undefined {
    return this.variants?.find(v => v.isDefaultVariant) || this.variants?.[0];
  }
  
  // Helper: Get currently selected variant
  get selectedVariant(): ProductVariantSM | undefined {
    if (this.selectedVariantId) {
      return this.variants?.find(v => v.id === this.selectedVariantId);
    }
    return this.defaultVariant;
  }
  
  // Helper: Get active variants only (in stock)
  get activeVariants(): ProductVariantSM[] {
    return this.variants?.filter(v => (v.isActive !== false) && v.stock > 0) || [];
  }
  
  // Helper: Get all available variants (including out of stock but active)
  get availableVariants(): ProductVariantSM[] {
    return this.variants?.filter(v => v.isActive !== false) || [];
  }
  
  // Helper: Get price from selected variant (replaces deprecated product.price)
  get price(): number {
    return this.selectedVariant?.price ?? 0;
  }
  
  // Helper: Get compare price from selected variant (replaces deprecated product.comparePrice)
  get comparePrice(): number | undefined {
    return this.selectedVariant?.comparePrice;
  }
  
  // Helper: Get stock from selected variant (replaces deprecated product.stock)
  get stock(): number {
    return this.selectedVariant?.stock ?? 0;
  }
  
  // Helper: Get SKU from selected variant (replaces deprecated product.sku)
  get sku(): string {
    return this.selectedVariant?.sku ?? '';
  }
  
  // Helper: Get unit symbol from selected variant
  get unitSymbol(): string {
    return this.selectedVariant?.unitSymbol ?? '';
  }
  
  // Helper: Get unit name from selected variant
  get unitName(): string {
    return this.selectedVariant?.unitName ?? '';
  }
  
  // Helper: Get weight from selected variant
  get weight(): number {
    return this.selectedVariant?.weight ?? 0;
  }
  
  // Helper: Get stock status for UI display
  get stockStatus(): StockStatus {
    const stock = this.stock;
    if (stock <= 0) return StockStatus.OUT_OF_STOCK;
    if (stock <= LOW_STOCK_THRESHOLD) return StockStatus.LOW_STOCK;
    return StockStatus.IN_STOCK;
  }
  
  // Helper: Check if product is out of stock
  get isOutOfStock(): boolean {
    return this.stock <= 0;
  }
  
  // Helper: Check if product is low stock
  get isLowStock(): boolean {
    const stock = this.stock;
    return stock > 0 && stock <= LOW_STOCK_THRESHOLD;
  }
  
  // Helper: Check if product has discount
  get hasDiscount(): boolean {
    const compare = this.comparePrice;
    return compare !== undefined && compare > this.price;
  }
  
  // Helper: Get discount percentage
  get discountPercentage(): number {
    if (!this.hasDiscount || !this.comparePrice) return 0;
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  
  // Helper: Get formatted weight string
  get formattedWeight(): string {
    const w = this.weight;
    if (!w) return '';
    if (w >= 1000) return `${(w / 1000).toFixed(1)} kg`;
    return `${w} g`;
  }
  
  // Helper: Check if product has multiple variants
  get hasMultipleVariants(): boolean {
    return (this.variants?.length ?? 0) > 1;
  }
  
  // Helper: Check if variant selection is valid for purchase
  get canAddToCart(): boolean {
    return this.selectedVariant !== undefined && 
           this.selectedVariant.isActive !== false && 
           this.stock > 0;
  }
}
