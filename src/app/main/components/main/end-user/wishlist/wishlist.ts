import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface WishlistItem {
  id: string;
  title: string;
  price: number;
  image: string;
  status: 'In Stock' | 'Limited' | 'Out of Stock';
  notes?: string;
  addedAt: string;
  selected?: boolean;
}

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.html',
  styleUrls: ['./wishlist.scss'],
  imports:[CommonModule,FormsModule]
})
export class WishlistComponent implements OnInit {
  wishlist: WishlistItem[] = [];
  isLoading = true;
  undoVisible = false;
  lastRemoved: { item: WishlistItem; index: number } | null = null;
  undoTimer: any = null;

  // UI state
  searchTerm = '';
  statusFilter = '';
  sortBy: 'addedDesc' | 'priceAsc' | 'priceDesc' = 'addedDesc';
  openDropdown: '' | 'filter' | 'sort' = '';
  page = 1;
  pageSize = 6;
  isMobile = false;
  listName = 'Default';
  lastAction = '';
  constructor() {}

  ngOnInit() {
    this.detectMobile();
    // simulate loading
    setTimeout(() => {
      this.loadFromStorage();
      this.isLoading = false;
    }, 400);
  }

  /* ---------- storage & sample data ---------- */
  loadSample() {
    const now = new Date();
    const sample: WishlistItem[] = [
      { id: 'p1', title: 'Minimal Leather Wallet', price: 1299, image: 'https://picsum.photos/seed/w1/400/400', status: 'In Stock', notes: 'Brown, RFID safe', addedAt: new Date(now.getTime()-1000*60*60*24*1).toISOString() },
      { id: 'p2', title: 'Wireless Earbuds Pro', price: 3999, image: 'https://picsum.photos/seed/w2/400/400', status: 'Limited', notes: 'Noise-cancelling', addedAt: new Date(now.getTime()-1000*60*60*24*4).toISOString() },
      { id: 'p3', title: 'Classic Denim Jacket', price: 2499, image: 'https://picsum.photos/seed/w3/400/400', status: 'In Stock', notes: 'Unisex', addedAt: new Date(now.getTime()-1000*60*60*24*30).toISOString() },
      { id: 'p4', title: 'Smartwatch 2.0', price: 8999, image: 'https://picsum.photos/seed/w4/400/400', status: 'Out of Stock', notes: '2 day battery', addedAt: new Date(now.getTime()-1000*60*60*24*2).toISOString() },
      { id: 'p5', title: 'Travel Backpack 35L', price: 3299, image: 'https://picsum.photos/seed/w5/400/400', status: 'In Stock', notes: 'Water-resistant', addedAt: new Date(now.getTime()-1000*60*60*24*8).toISOString() },
      { id: 'p6', title: 'Ceramic Coffee Mug', price: 499, image: 'https://picsum.photos/seed/w6/400/400', status: 'Limited', notes: 'Matte finish', addedAt: new Date(now.getTime()-1000*60*60*24*11).toISOString() },
      { id: 'p7', title: 'Noise-Isolating Headphones', price: 5499, image: 'https://picsum.photos/seed/w7/400/400', status: 'In Stock', notes: 'Over-ear, comfy', addedAt: new Date(now.getTime()-1000*60*60*24*18).toISOString() }
    ];
    this.wishlist = sample;
    this.saveToStorage();
  }

  loadFromStorage() {
    const raw = localStorage.getItem('wishlist_v1');
    if (raw) {
      try {
        this.wishlist = JSON.parse(raw);
      } catch {
        this.wishlist = [];
      }
    } else {
      // no data yet — keep empty to show empty state
      this.wishlist = [];
    }
  }

  saveToStorage() {
    localStorage.setItem('wishlist_v1', JSON.stringify(this.wishlist));
  }

  /* ---------- computed lists ---------- */
  get filteredWishlist(): WishlistItem[] {
    let arr = [...this.wishlist];
    if (this.searchTerm) {
      const q = this.searchTerm.toLowerCase();
      arr = arr.filter(i => i.title.toLowerCase().includes(q) || (i.notes || '').toLowerCase().includes(q));
    }
    if (this.statusFilter) {
      arr = arr.filter(i => i.status === this.statusFilter);
    }
    if (this.sortBy === 'priceAsc') arr.sort((a,b) => a.price - b.price);
    else if (this.sortBy === 'priceDesc') arr.sort((a,b) => b.price - a.price);
    else arr.sort((a,b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    return arr;
  }

  get pagedWishlist(): WishlistItem[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredWishlist.slice(start, start + this.pageSize);
  }

  get totalPages() { return Math.max(1, Math.ceil(this.filteredWishlist.length / this.pageSize)); }
  get totalCount() { return this.wishlist.length; }

  /* ---------- actions ---------- */
  removeFromWishlist(id: string) {
    const index = this.wishlist.findIndex(x => x.id === id);
    if (index === -1) return;
    this.lastRemoved = { item: this.wishlist[index], index };
    this.wishlist.splice(index, 1);
    this.saveToStorage();
    this.showUndo();
  }

  undoRemove() {
    if (!this.lastRemoved) return;
    this.wishlist.splice(this.lastRemoved.index, 0, this.lastRemoved.item);
    this.saveToStorage();
    this.dismissUndo();
  }

  dismissUndo() {
    this.lastRemoved = null;
    this.undoVisible = false;
    if (this.undoTimer) { clearTimeout(this.undoTimer); this.undoTimer = null; }
  }

  showUndo() {
    this.undoVisible = true;
    if (this.undoTimer) clearTimeout(this.undoTimer);
    this.undoTimer = setTimeout(() => {
      this.undoVisible = false;
      this.lastRemoved = null;
      this.undoTimer = null;
    }, 7000);
  }

  moveToCart(item: WishlistItem) {
    // Replace with your cart service integration later
    console.log('Move to cart:', item);
    this.lastAction = `Moved "${item.title}" to cart`;
    // Optionally remove from wishlist
    this.removeFromWishlist(item.id);
  }

  shareItem(item: WishlistItem) {
    const shareData = { title: item.title, text: `${item.title} — ₹${item.price}`, url: window.location.href + '?product=' + item.id };
    if ((navigator as any).share) {
      (navigator as any).share(shareData).catch(()=>{});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareData.url).then(()=> alert('Product link copied to clipboard'));
    } else {
      alert('Share not supported — copy the link manually.');
    }
  }

  /* ---------- bulk actions ---------- */
  hasSelection() { return this.wishlist.some(i => i.selected); }

  bulkRemove() {
    const toRemove = this.wishlist.filter(i => i.selected);
    if (!toRemove.length) return;
    toRemove.forEach(x => this.removeFromWishlist(x.id));
    // deselect all
    this.wishlist.forEach(i => i.selected = false);
    this.saveToStorage();
  }

  bulkMoveToCart() {
    const toMove = this.wishlist.filter(i => i.selected);
    toMove.forEach(i => {
      this.moveToCart(i);
    });
    // deselect
    this.wishlist.forEach(i => i.selected = false);
    this.saveToStorage();
  }

  toggleSelectAll(value: boolean) {
    this.wishlist.forEach(i => i.selected = !!value);
    this.onSelectionChange();
  }

  onSelectionChange() {
    // maintain UI state; could update a toolbar count
  }

  get allSelected() { return this.wishlist.length && this.wishlist.every(i => !!i.selected); }

  /* ---------- UI helpers ---------- */
  statusClass(status: string) {
    if (status === 'In Stock') return 'instock';
    if (status === 'Limited') return 'limited';
    return 'outofstock';
  }

  toggleDropdown(which: 'filter' | 'sort') {
    this.openDropdown = this.openDropdown === which ? '' : which;
  }

  setFilter(status: '' | 'In Stock' | 'Limited' | 'Out of Stock') {
    this.statusFilter = status;
    this.openDropdown = '';
    this.page = 1;
  }

  setSort(sort: 'addedDesc' | 'priceAsc' | 'priceDesc') {
    this.sortBy = sort;
    this.openDropdown = '';
  }

  get sortByLabel() {
    if (this.sortBy === 'priceAsc') return 'Price ↑';
    if (this.sortBy === 'priceDesc') return 'Price ↓';
    return 'Recently added';
  }

  /* ---------- pagination ---------- */
  nextPage() {
    if (this.page < this.totalPages) this.page++;
  }
  prevPage() {
    if (this.page > 1) this.page--;
  }
  loadMore() {
    if (this.page < this.totalPages) this.page++;
  }

  /* ---------- responsive helpers ---------- */
  @HostListener('window:resize', [])
  detectMobile() {
    this.isMobile = window.innerWidth < 900;
  }
}
