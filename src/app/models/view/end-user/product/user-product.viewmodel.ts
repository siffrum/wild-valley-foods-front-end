import { BaseViewModel } from '../../../internal/base.viewmodel';
import { ProductSM } from '../../../service-models/app/v1/product-s-m';
import { ReviewSM } from '../../../service-models/app/v1/review-s-m';

export class UserProductViewModel extends BaseViewModel {
  product = new ProductSM();
  selectedImageIndex = 0;
  loading = false;
  qty = 1;
  maxQty = 1;
  errorMsg = '';
  products!: ProductSM[];
  filteredProducts!: ProductSM[];
  categoryId!: number;
  reviewsSM: ReviewSM[] = [];
  cartItems: ProductSM[] = [];
  showReviews = false;
  averageRating = 0;
}
