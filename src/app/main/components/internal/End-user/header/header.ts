import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,              
  imports: [CommonModule,RouterModule],      
  templateUrl: './header.html',
  styleUrls: ['./header.scss']   
})
export class Header {
  isLoggedIn: boolean = false;
  categories = [
  {
    name: 'Dry Fruits',
    icon: 'bi bi-nut',
    items: ['Almonds', 'Cashews', 'Walnuts', 'Pistachios']
  },
  {
    name: 'Seeds',
    icon: 'bi bi-droplet',
    items: ['Chia Seeds', 'Flax Seeds', 'Pumpkin Seeds']
  },
  {
    name: 'Beverages',
    icon: 'bi bi-cup-straw',
    items: ['Herbal Tea', 'Green Tea', 'Fruit Juices']
  },
  {
    name: 'Gift Packs',
    icon: 'bi bi-gift',
    items: ['Festive Hampers', 'Corporate Packs']
  }
];
  // Dummy cart items
  cartItems = [
    {
      name: 'Organic Almonds (500g)',
      image: 'https://picsum.photos/80/80?random=1',
      price: 499,
      sku: 'DF-0001',
      qty: 1
    },
    {
      name: 'Cashews Premium (250g)',
      image: 'https://picsum.photos/80/80?random=2',
      price: 299,
      sku: 'DF-0002',
      qty: 2
    },
    {
      name: 'Walnuts (200g)',
      image: 'https://picsum.photos/80/80?random=3',
      price: 399,
      sku: 'DF-0003',
      qty: 1
    }
  ];

  // Compute total price
  cartTotal(): number {
    return this.cartItems.reduce((total, item) => total + item.price * item.qty, 0);
  }
}
