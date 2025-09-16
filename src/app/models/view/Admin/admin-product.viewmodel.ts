import { BaseViewModel } from '../../internal/base.viewmodel';
import { CategorySM } from '../../service-models/app/v1/categories-s-m';
import { ProductSM } from '../../service-models/app/v1/product-s-m';

export class AdminProductsViewModel extends BaseViewModel {
  fileName: string = '';
  updateMode: boolean = false;
  productFormData: ProductSM = new ProductSM();
  singleProduct: ProductSM | null = null;

  products: ProductSM[] = [];
  filteredProducts: ProductSM[] = [];
  categories: CategorySM[] = []; // for dropdown

  searchTerm = '';
  sortField = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
}
