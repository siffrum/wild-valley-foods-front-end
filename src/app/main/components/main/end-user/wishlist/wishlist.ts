import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WishlistService } from '../../../../../services/wishlist.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { log } from 'console';
import { ProductSM } from '../../../../../models/service-models/app/v1/product-s-m';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.html', // your template path
  styleUrls: ['./wishlist.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class WishlistComponent implements OnInit, OnDestroy {
  isLoading = false;
  listName = 'My Wishlist';
  totalCount = 0;

  // UI state
  openDropdown: '' | 'filter' | 'sort' = '';
  statusFilter = '';
  sortByLabel = 'Default';
  sortKey: '' | 'addedDesc' | 'priceAsc' | 'priceDesc' = '';
  searchTerm = '';

  // selection + pager
  allSelected = false;
  page = 1;
  pageSize = 6;
  totalPages = 1;

  // Undo
  undoVisible = false;
  lastRemoved = new ProductSM();
  private undoTimeoutId: any = null;

  // internal lists
  private allItems: ProductSM[] = [];
  filteredWishlist: ProductSM[] = [];
  pagedWishlist: ProductSM[] = [];

  // mobile detection (simple)
  isMobile = false;

  private sub = new Subscription();

  constructor(private wishlistService: WishlistService) {}

  async ngOnInit() {
    this.detectMobile();
    this.isLoading = true;
    try {
      this.allItems = (await this.wishlistService.getAll()) ?? [];
      this.applyFiltersAndPaging();
      this.totalCount = this.allItems.length;
      this.isLoading = false;
    } catch (error) {
      // Handle the error
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    if (this.undoTimeoutId) {
      clearTimeout(this.undoTimeoutId);
      this.undoTimeoutId = null;
    }
  }

  // call this on window resize if needed, or rely on CSS media queries
  detectMobile() {
    try {
      this.isMobile = window.innerWidth <= 768;
    } catch {
      this.isMobile = false;
    }
  }

  // UI helpers used in template
  toggleDropdown(name: 'filter' | 'sort') {
    this.openDropdown = this.openDropdown === name ? '' : name;
  }

  setFilter(status: string) {
    this.statusFilter = status;
    this.openDropdown = '';
    this.page = 1;
    this.applyFiltersAndPaging();
  }

  setSort(key: 'addedDesc' | 'priceAsc' | 'priceDesc') {
    this.sortKey = key;
    this.sortByLabel =
      key === 'addedDesc'
        ? 'Recently Added'
        : key === 'priceAsc'
        ? 'Price: Low → High'
        : 'Price: High → Low';
    this.openDropdown = '';
    this.applyFiltersAndPaging();
  }

  // call whenever the search input changes (two ways binding already)
  onSearchChanged() {
    this.page = 1;
    this.applyFiltersAndPaging();
  }

  applyFiltersAndPaging() {
    // filter
    let list = this.allItems.slice();
    console.log(list);

    // search
    if (this.searchTerm && this.searchTerm.trim().length) {
      const q = this.searchTerm.trim().toLowerCase();
      list = list.filter((it) => it.name && it.name.toLowerCase().includes(q));
    }

    // status filter
    if (this.statusFilter && this.statusFilter.length) {
      list = list.filter((it) => it.status === this.statusFilter);
    }

    // sort
    if (this.sortKey === 'addedDesc') {
      list.sort((a, b) => {
        if (b.addedAt !== undefined && a.addedAt !== undefined) {
          return b.addedAt - a.addedAt;
        } else {
          return 0;
        }
      });
    } else if (this.sortKey === 'priceAsc') {
      list.sort((a, b) => a.price - b.price);
    } else if (this.sortKey === 'priceDesc') {
      list.sort((a, b) => b.price - a.price);
    }

    this.filteredWishlist = list;
    this.totalPages = Math.max(
      1,
      Math.ceil(this.filteredWishlist.length / this.pageSize)
    );

    // clamp page
    if (this.page > this.totalPages) this.page = this.totalPages;

    // paging behavior: for 'Load more' behavior we will show page * pageSize items
    const upto = this.page * this.pageSize;
    this.pagedWishlist = this.filteredWishlist.slice(0, upto);

    this.recalcAllSelected();
  }

  // paging controls in template
  prevPage() {
    if (this.page <= 1) return;
    this.page--;
    this.applyFiltersAndPaging();
  }

  nextPage() {
    if (this.page >= this.totalPages) return;
    this.page++;
    this.applyFiltersAndPaging();
  }

  loadMore() {
    if (this.page < this.totalPages) {
      this.page++;
      this.applyFiltersAndPaging();
    }
  }

  // selection logic
  toggleSelectAll(checked: boolean) {
    // mark only current paged items
    const ids = this.pagedWishlist.map((it) => it.id);
    const updated = this.allItems.map((it) => {
      if (ids.includes(it.id)) {
        return { ...it, selected: checked };
      }
      return it;
    });
    this.wishlistService.setAll(updated);
    // service emits -> subscription updates lists
  }

  onSelectionChange() {
    // recalc allSelected based on visible items
    this.recalcAllSelected();
  }

  recalcAllSelected() {
    if (!this.pagedWishlist || this.pagedWishlist.length === 0) {
      this.allSelected = false;
      return;
    }
    this.allSelected = this.pagedWishlist.every((it) => !!it.selected);
  }

  hasSelection(): boolean {
    return this.allItems.some((it) => it.selected);
  }

  // item actions
  async moveToCart(item: ProductSM) {
    try {
      const removed = await this.wishlistService.removeById(item.id);
      if (removed) {
        // TODO: call your cart service to add this item
        console.log('Moved to cart:', removed);
        this.showUndo(removed);
      }
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
    }
  }

  shareItem(item: ProductSM) {
    const shareText = `${item.name} — ₹${item.price}`;
    if ((navigator as any).share) {
      (navigator as any)
        .share({
          title: item.name,
          text: shareText,
          url: window.location.href,
        })
        .catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard
        .writeText(`${shareText} — ${window.location.href}`)
        .then(() => alert('Link copied to clipboard'))
        .catch(() => alert('Could not copy link'));
    } else {
      alert('Share not supported in this browser');
    }
  }

  async removeFromWishlist(id: number) {
    const removed = await this.wishlistService.removeById(id);
    if (!removed) return;
    this.showUndo(removed);
  }

  // Undo logic
  private showUndo(removed: ProductSM) {
    this.lastRemoved = removed; // index not used here (we're unshifting in service)
    this.undoVisible = true;
    if (this.undoTimeoutId) clearTimeout(this.undoTimeoutId);
    this.undoTimeoutId = setTimeout(() => {
      this.undoVisible = false;
      this.lastRemoved = new ProductSM();
      this.undoTimeoutId = null;
    }, 6000); // 6s to undo
  }

  undoRemove() {
    if (!this.lastRemoved) return;
    // Re-add item at top
    this.wishlistService.addOrUpdate(this.lastRemoved);
    this.undoVisible = false;
    if (this.undoTimeoutId) clearTimeout(this.undoTimeoutId);
    this.undoTimeoutId = null;
    this.lastRemoved = new ProductSM();
  }

  dismissUndo() {
    this.undoVisible = false;
    if (this.undoTimeoutId) clearTimeout(this.undoTimeoutId);
    this.undoTimeoutId = null;
    this.lastRemoved = new ProductSM();
  }

  // Bulk actions
  async bulkMoveToCart() {
    const ids = this.allItems.filter((it) => it.selected).map((x) => x.id);
    if (ids.length === 0) return;
    const moved = this.wishlistService.moveItemsToCart(ids);
    moved.then((result) => {
      if (result.length) {
        this.showUndo(result[0]);
      }
    });
  }

  async bulkRemove() {
    const ids = this.allItems.filter((it) => it.selected).map((x) => x.id);
    if (ids.length === 0) return;
    const removed = await this.wishlistService.removeByIds(ids);
    if (removed.length) this.showUndo(removed[0]);
  }

  // helper used in template for badge class
  statusClass(status: string) {
    switch (status) {
      case 'In Stock':
        return 'in-stock';
      case 'Limited':
        return 'limited';
      case 'Out of Stock':
        return 'out';
      default:
        return '';
    }
  }
}
