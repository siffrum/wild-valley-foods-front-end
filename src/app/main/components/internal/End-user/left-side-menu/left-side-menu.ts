import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CategorySM {
  id?: number;
  name: string;
  description?: string;
  category_icon?: string;
  slider?: boolean;
  sequence?: number;
  status?: 'active' | 'inactive';
}

@Component({
  selector: 'app-left-offcanvas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="offcanvas offcanvas-start"
      tabindex="-1"
      [id]="id"
      [attr.aria-labelledby]="id + 'Label'"
    >
      <div class="offcanvas-header">
        <div class="d-flex align-items-center">
          <img
            src="assets/avatar-placeholder.png"
            alt="User avatar"
            class="rounded-circle me-2"
            width="44"
            height="44"
          />
          <div>
            <div class="fw-bold">
              @if (isLoggedIn) { {{ userName || 'Customer' }} } @else { Hello,
              Guest }
            </div>
            <small class="text-muted"
              >@if (isLoggedIn) { Manage your account } @else { Sign in to
              access orders & offers }</small
            >
          </div>
        </div>
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>

      <div class="offcanvas-body p-0 d-flex flex-column">
        <!-- Search -->
        <div class="p-3 border-bottom">
          <form class="d-flex" role="search" (submit)="onSearch($event)">
            <input
              class="form-control me-2"
              [(ngModel)]="searchQuery"
              name="menuSearch"
              placeholder="Search products, categories..."
              aria-label="Search"
            />
            <button
              class="btn btn-outline-secondary"
              type="submit"
              aria-label="Search"
            >
              <i class="bi bi-search"></i>
            </button>
          </form>
        </div>

        <!-- Nav / categories -->
        <div class="p-3 flex-grow-1 overflow-auto">
          <nav class="nav flex-column gap-2">
            <a class="nav-link d-flex align-items-center" href="#"
              ><i class="bi bi-house me-2"></i> Home</a
            >
            <a class="nav-link d-flex align-items-center" href="#"
              ><i class="bi bi-tag me-2"></i> Offers & Deals
              <span class="badge bg-success ms-auto">20% OFF</span>
            </a>

            <div class="mt-3">
              <div class="small text-uppercase text-muted mb-1">Account</div>
              <a class="nav-link d-flex align-items-center" href="#"
                ><i class="bi bi-person me-2"></i> My Profile</a
              >
              <a class="nav-link d-flex align-items-center" href="#"
                ><i class="bi bi-bag me-2"></i> My Orders</a
              >
              <a class="nav-link d-flex align-items-center" href="#"
                ><i class="bi bi-heart me-2"></i> Wishlist
                <span class="badge bg-outline ms-auto">{{
                  wishlistCount
                }}</span></a
              >
              <a class="nav-link d-flex align-items-center" href="#"
                ><i class="bi bi-geo-alt me-2"></i> Saved Addresses</a
              >
            </div>

            <hr />

            <div class="small text-uppercase text-muted mb-1">
              Shop by category
            </div>

            <div class="accordion" id="leftCategories">
              @for (cat of categories; track cat) {
              <div class="accordion-item">
                <h2 class="accordion-header" id="heading-{{ cat.id }}">
                  <button
                    class="accordion-button collapsed py-2"
                    type="button"
                    data-bs-toggle="collapse"
                    [attr.data-bs-target]="'#collapse-' + cat.id"
                    aria-expanded="false"
                    [attr.data-bs-target]="'#collapse-' + cat.id"
                  >
                    <i class="bi bi-list me-2"></i> {{ cat.name }}
                  </button>
                </h2>
                <div
                  id="collapse-{{ cat.id }}"
                  class="accordion-collapse collapse"
                  [attr.data-bs-target]="'#collapse-' + cat.id"
                  data-bs-parent="#leftCategories"
                >
                  <div class="accordion-body p-2">
                    <small class="text-muted">{{ cat.description }}</small>
                  </div>
                </div>
              </div>
              }
            </div>

            <hr />

            <div class="mb-2">
              <div class="small text-uppercase text-muted mb-1">
                Deals & Wallet
              </div>
              <a class="nav-link d-flex align-items-center" href="#"
                ><i class="bi bi-ticket-perforated me-2"></i> Coupons &
                Vouchers</a
              >
              <a class="nav-link d-flex align-items-center" href="#"
                ><i class="bi bi-wallet2 me-2"></i> Gift Cards</a
              >
            </div>

            <hr />

            <div class="mb-2">
              <div class="small text-uppercase text-muted mb-1">Support</div>
              <a class="nav-link d-flex align-items-center" href="#"
                ><i class="bi bi-question-circle me-2"></i> Help Center</a
              >
              <a class="nav-link d-flex align-items-center" href="#"
                ><i class="bi bi-chat-left-text me-2"></i> Contact Us</a
              >
              <a class="nav-link d-flex align-items-center" href="#"
                ><i class="bi bi-gear me-2"></i> Settings</a
              >
            </div>
          </nav>
        </div>

        <div class="p-3 border-top">
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary w-100">Sign In</button>
            <button class="btn btn-primary w-100">Create Account</button>
          </div>

          <div
            class="d-flex justify-content-between align-items-center mt-3 small text-muted"
          >
            <div><i class="bi bi-globe me-1"></i> {{ language }}</div>
            <div><i class="bi bi-currency-rupee me-1"></i> {{ currency }}</div>
          </div>

          <div class="mt-3 d-flex gap-2">
            <a href="#" class="btn btn-sm btn-outline-secondary w-100"
              ><i class="bi bi-phone me-1"></i> Download App</a
            >
            <a href="#" class="btn btn-sm btn-outline-secondary w-100"
              ><i class="bi bi-share me-1"></i> Share</a
            >
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .offcanvas-body .overflow-auto {
        max-height: calc(100vh - 260px);
      }
    `,
  ],
})
export class LeftOffcanvasComponent {
  @Input() id = 'offcanvasLeft';
  @Input() userName?: string;
  @Input() isLoggedIn = false;
  @Input() categories: CategorySM[] = [];
  @Input() wishlistCount = 0;
  @Input() language = 'English';
  @Input() currency = 'INR';

  searchQuery = '';

  onSearch(e: Event) {
    e.preventDefault();
    // emit or navigate — placeholder behavior; parent can wire search using template ref or event
    if (this.searchQuery?.trim()) {
      // simple behavior: navigate or close — left as TODO for parent integration
      const off = document.getElementById(this.id);
      new (window as any).bootstrap.Offcanvas(off).hide();
      // parent should handle search; we kept this local for demonstration
    }
  }
}
