import { BaseViewModel } from '../../internal/base.viewmodel';
import { BannerSM } from '../../service-models/app/v1/website-resource/banner-s-m';
import { AdminProductsViewModel } from '../Admin/admin-product.viewmodel';
import { AdminCategoriesViewModel } from '../Admin/admin.categories.viewmodel';
import { BannerViewModel } from '../website-resource/banner.viewmodel';

export class HomeViewModel extends BaseViewModel {
  banners: BannerSM[] = [];
  bannerViewModel = new BannerViewModel();
  productsViewModel:AdminProductsViewModel = new AdminProductsViewModel();
  categoryViewModel:AdminCategoriesViewModel = new AdminCategoriesViewModel();
  
}
