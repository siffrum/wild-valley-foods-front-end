import { Subject } from 'rxjs';
import { BaseViewModel } from '../../internal/base.viewmodel';
import { CategorySM } from '../../service-models/app/v1/categories-s-m';
import { ProductSM } from '../../service-models/app/v1/product-s-m';

export class AdminProductComponentViewModel extends BaseViewModel {
  productSM: ProductSM = new ProductSM();
  products: ProductSM[] = [];
  filteredProducts: ProductSM[] = [];
  categories: CategorySM[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  searchTerm = '';
  selectedCategory = 'all';
  sortField = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchSubject = new Subject<string>();
  isLoading = false;
}
