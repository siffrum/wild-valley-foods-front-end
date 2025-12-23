/**
 * Product Utility Functions
 * 
 * These utilities work with plain objects from API/IndexedDB
 * since class getters don't work on plain JSON objects.
 */

import { ProductSM } from '../models/service-models/app/v1/product-s-m';
import { ProductVariantSM } from '../models/service-models/app/v1/variants-s-m';

/**
 * Low stock threshold
 */
const LOW_STOCK_THRESHOLD = 5;

/**
 * Product Utility Class
 * Static methods that work with plain objects
 */
export class ProductUtils {
  
  /**
   * Get the default variant for a product
   */
  static getDefaultVariant(product: any): any | undefined {
    if (!product?.variants?.length) return undefined;
    return product.variants.find((v: any) => v.isDefaultVariant) || product.variants[0];
  }

  /**
   * Get the currently selected variant
   */
  static getSelectedVariant(product: any): any | undefined {
    if (!product?.variants?.length) return undefined;
    
    if (product.selectedVariantId) {
      const found = product.variants.find((v: any) => v.id === product.selectedVariantId);
      if (found) return found;
    }
    return ProductUtils.getDefaultVariant(product);
  }

  /**
   * Get price from selected variant
   */
  static getPrice(product: any): number {
    const variant = ProductUtils.getSelectedVariant(product);
    return variant?.price ?? 0;
  }

  /**
   * Get compare price from selected variant
   */
  static getComparePrice(product: any): number | undefined {
    const variant = ProductUtils.getSelectedVariant(product);
    return variant?.comparePrice;
  }

  /**
   * Get stock from selected variant
   */
  static getStock(product: any): number {
    const variant = ProductUtils.getSelectedVariant(product);
    return variant?.stock ?? 0;
  }

  /**
   * Get weight from selected variant
   */
  static getWeight(product: any): number {
    const variant = ProductUtils.getSelectedVariant(product);
    return variant?.weight ?? 0;
  }

  /**
   * Get SKU from selected variant
   */
  static getSku(product: any): string {
    const variant = ProductUtils.getSelectedVariant(product);
    return variant?.sku ?? '';
  }

  /**
   * Get unit symbol from selected variant
   */
  static getUnitSymbol(product: any): string {
    const variant = ProductUtils.getSelectedVariant(product);
    return variant?.unitSymbol || variant?.unitName || '';
  }

  /**
   * Check if product is out of stock
   */
  static isOutOfStock(product: any): boolean {
    return ProductUtils.getStock(product) <= 0;
  }

  /**
   * Check if product is low stock
   */
  static isLowStock(product: any): boolean {
    const stock = ProductUtils.getStock(product);
    return stock > 0 && stock <= LOW_STOCK_THRESHOLD;
  }

  /**
   * Check if product has discount
   */
  static hasDiscount(product: any): boolean {
    const price = ProductUtils.getPrice(product);
    const comparePrice = ProductUtils.getComparePrice(product);
    return comparePrice !== undefined && comparePrice > price;
  }

  /**
   * Get discount percentage
   */
  static getDiscountPercentage(product: any): number {
    if (!ProductUtils.hasDiscount(product)) return 0;
    const price = ProductUtils.getPrice(product);
    const comparePrice = ProductUtils.getComparePrice(product)!;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  }

  /**
   * Get formatted weight string
   */
  // static getFormattedWeight(product: any): string {
  //   const weight = ProductUtils.getWeight(product);
  //   if (!weight) return '';
  //   if (weight >= 1000) return `${(weight / 1000).toFixed(1)} kg`;
  //   return `${weight} g`;
  // }
static getFormattedWeight(product: any): string {
  const rawWeight: unknown = ProductUtils.getWeight(product);

  // null / undefined
  if (rawWeight == null) {
    return '';
  }

  // empty string (ONLY if string)
  if (typeof rawWeight === 'string' && rawWeight.trim() === '') {
    return '';
  }

  const weight = Number(rawWeight);

  if (Number.isNaN(weight) || weight <= 0) {
    return '';
  }

  const unit = (product?.weightUnit || product?.unit || 'g').toLowerCase();

  const format = (value: number): string =>
    Number.isInteger(value)
      ? value.toString()
      : value.toFixed(2).replace(/\.?0+$/, '');

  switch (unit) {
    case 'g':
    case 'gram':
    case 'grams':
      return weight >= 1000
        ? `${format(weight / 1000)} kg`
        : `${format(weight)} g`;

    case 'kg':
    case 'kilogram':
    case 'kilograms':
      return `${format(weight)} kg`;

    case 'lb':
    case 'lbs':
    case 'pound':
    case 'pounds':
      return `${format(weight)} lb`;

    case 'ml':
    case 'milliliter':
    case 'milliliters':
      return weight >= 1000
        ? `${format(weight / 1000)} l`
        : `${format(weight)} ml`;

    case 'l':
    case 'liter':
    case 'liters':
      return `${format(weight)} l`;

    case 'pack':
    case 'packs':
    case 'pcs':
    case 'piece':
    case 'pieces':
      return `${format(weight)} ${unit}`;

    default:
      return `${format(weight)} ${unit}`;
  }
}




  /**
   * Check if product has multiple variants
   */
  static hasMultipleVariants(product: any): boolean {
    return (product?.variants?.length ?? 0) > 1;
  }

  /**
   * Get available variants (active variants)
   */
  static getAvailableVariants(product: any): any[] {
    return product?.variants?.filter((v: any) => v.isActive !== false) || [];
  }

  /**
   * Get active variants (in stock)
   */
  static getActiveVariants(product: any): any[] {
    return product?.variants?.filter((v: any) => v.isActive !== false && v.stock > 0) || [];
  }

  /**
   * Check if product can be added to cart
   */
  static canAddToCart(product: any): boolean {
    const variant = ProductUtils.getSelectedVariant(product);
    return variant !== undefined && 
           variant.isActive !== false && 
           (variant.stock ?? 0) > 0;
  }

  /**
   * Initialize selected variant if not set
   */
  static initializeSelectedVariant(product: any): void {
    if (!product?.variants?.length) return;
    
    if (product.selectedVariantId) {
      const exists = product.variants.some((v: any) => v.id === product.selectedVariantId);
      if (exists) return;
    }

    const defaultVariant = ProductUtils.getDefaultVariant(product);
    if (defaultVariant) {
      product.selectedVariantId = defaultVariant.id;
    }
  }

  /**
   * Get stock status text
   */
  static getStockStatus(product: any): string {
    if (ProductUtils.isOutOfStock(product)) return 'Out of Stock';
    if (ProductUtils.isLowStock(product)) return 'Low Stock';
    return 'In Stock';
  }

  /**
   * Get stock status class for styling
   */
  static getStockStatusClass(product: any): string {
    if (ProductUtils.isOutOfStock(product)) return 'bg-danger';
    if (ProductUtils.isLowStock(product)) return 'bg-warning text-dark';
    return 'bg-success';
  }

  /**
   * Get average rating
   */
  static getAverageRating(product: any): number {
    return product?.averageRating ?? 0;
  }

  /**
   * Get review count
   */
  static getReviewCount(product: any): number {
    return product?.reviewCount ?? 0;
  }

  /**
   * Check if product has reviews
   */
  static hasReviews(product: any): boolean {
    return (product?.reviewCount ?? 0) > 0;
  }

  /**
   * Get full stars count for rating display
   */
  static getFullStars(product: any): number {
    return Math.floor(ProductUtils.getAverageRating(product));
  }

  /**
   * Check if rating has half star
   */
  static hasHalfStar(product: any): boolean {
    const rating = ProductUtils.getAverageRating(product);
    return (rating % 1) >= 0.5;
  }

  /**
   * Get formatted rating string
   */
  static getFormattedRating(product: any): string {
    const rating = ProductUtils.getAverageRating(product);
    return rating > 0 ? rating.toFixed(1) : '0.0';
  }
}

/**
 * Variant Utility Class
 */
export class VariantUtils {
  
  /**
   * Get effective min order quantity
   */
  static getEffectiveMinOrderQuantity(variant: any): number {
    return variant?.minOrderQuantity ?? 1;
  }

  /**
   * Get effective max order quantity
   */
  static getEffectiveMaxOrderQuantity(variant: any): number {
    const max = variant?.maxOrderQuantity ?? Infinity;
    return Math.min(max, variant?.stock ?? 0);
  }

  /**
   * Check if variant is available
   */
  static isAvailable(variant: any): boolean {
    return (variant?.isActive !== false) && ((variant?.stock ?? 0) > 0);
  }

  /**
   * Validate order quantity
   */
  static isValidQuantity(variant: any, qty: number): boolean {
    const min = VariantUtils.getEffectiveMinOrderQuantity(variant);
    const max = VariantUtils.getEffectiveMaxOrderQuantity(variant);
    return qty >= min && qty <= max;
  }
}

