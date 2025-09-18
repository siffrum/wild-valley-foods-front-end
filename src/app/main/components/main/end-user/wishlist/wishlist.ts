import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IndexDBStorageService, WishlistItem } from '../../../../../services/indexdb.service';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.html',
  styleUrls: ['./wishlist.scss'],
  imports: [CommonModule, FormsModule]
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

  constructor(private indexDbStorageService: IndexDBStorageService) {}

  async ngOnInit() {
    this.detectMobile();
    await this.loadWishlist();
    this.isLoading = false;
  }

  async loadWishlist() {
    this.wishlist = await this.indexDbStorageService.getWishlist();
  }

  async removeFromWishlist(id: string) {
    await this.indexDbStorageService.removeFromWishlist(id);
    await this.loadWishlist();
    const index = this.wishlist.findIndex(x => x.id === id);
    if (index === -1) return;
    this.lastRemoved = { item: this.wishlist[index], index };
    this.wishlist.splice(index, 1);
    this.saveToStorage();
    this.showUndo();
  }

  saveToStorage() {
    localStorage.setItem('wishlist_v1', JSON.stringify(this.wishlist));
  }

  get filteredWishlist(): WishlistItem[] {
    let arr = [...this.wishlist];
    if (this.searchTerm) {
      const q = this.searchTerm.toLowerCase();
      arr = arr.filter(i => i.title.toLowerCase().includes(q) || (i.notes || '').toLowerCase().includes(q));
    }
    if (this.statusFilter) {
      arr = arr.filter(i => i.status === this.statusFilter);
    }
    if (this.sortBy === 'priceAsc') arr.sort((a, b) => a.price - b.price);
    else if (this.sortBy === 'priceDesc') arr.sort((a, b) => b.price - a.price);
    else arr.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    return arr;
  }

  get pagedWishlist(): WishlistItem[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredWishlist.slice(start, start + this.pageSize);
  }

  get totalPages() { return Math.max(1, Math.ceil(this.filteredWishlist.length / this.pageSize)); }
  get totalCount() { return this.wishlist.length; }

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
    // Integrate with your cart service if needed
    this.lastAction = `Moved "${item.title}" to cart`;
    this.removeFromWishlist(item.id);
  }

  shareItem(item: WishlistItem) {
    const shareData = { title: item.title, text: `${item.title} — ₹${item.price}`, url: window.location.href + '?product=' + item.id };
    if ((navigator as any).share) {
      (navigator as any).share(shareData).catch(() => { });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareData.url).then(() => alert('Product link copied to clipboard'));
    } else {
      alert('Share not supported — copy the link manually.');
    }
  }

  hasSelection() { return this.wishlist.some(i => i.selected); }

  async bulkRemove() {
    const toRemove = this.wishlist.filter(i => i.selected);
    if (!toRemove.length) return;
    for (const x of toRemove) await this.removeFromWishlist(x.id);
    this.wishlist.forEach(i => i.selected = false);
    this.saveToStorage();
  }

  bulkMoveToCart() {
    const toMove = this.wishlist.filter(i => i.selected);
    toMove.forEach(i => { this.moveToCart(i); });
    this.wishlist.forEach(i => i.selected = false);
    this.saveToStorage();
  }

  toggleSelectAll(value: boolean | any) {
    this.wishlist.forEach(i => i.selected = !!value);
    this.onSelectionChange();
  }

  onSelectionChange() { /* extend as needed */ }

  get allSelected() { return this.wishlist.length && this.wishlist.every(i => !!i.selected); }

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

  nextPage() { if (this.page < this.totalPages) this.page++; }
  prevPage() { if (this.page > 1) this.page--; }
  loadMore() { if (this.page < this.totalPages) this.page++; }

  @HostListener('window:resize', [])
  detectMobile() {
    this.isMobile = window.innerWidth < 900;
  }
}
