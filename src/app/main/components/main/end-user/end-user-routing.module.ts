// src/app/auth/auth-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './home/home';
import { EndUserLayout } from './end-user-layout/end-user-layout';
import { SingleProduct } from './single-product/single-product';
import { Shop } from './shop/shop';
import { CartComponent } from './cart/cart';
import { Checkout } from './checkout/checkout';
import { WishlistComponent } from './wishlist/wishlist';
import { MyOrders } from './my-orders/my-orders';
const routes: Routes = [
  {
    path: '',
    component: EndUserLayout,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: Home },
      {
        path: 'product/:id',
        component: SingleProduct,
      },
      { path: 'shop', component: Shop },
      { path: 'cart', component: CartComponent },
      { path: 'checkout', component: Checkout },
      { path: 'wishlist', component: WishlistComponent },
      {
        path:'my-orders',component:MyOrders
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EndUserRoutingModule {}
