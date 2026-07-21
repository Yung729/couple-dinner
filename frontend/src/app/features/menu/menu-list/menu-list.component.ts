import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MenuItemService } from '../../../core/menu-item.service';
import { SseService } from '../../../core/sse.service';
import { MenuItem } from '../../../shared/models/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ 'MENU.TITLE' | translate }}</h1>
        <a routerLink="/menu/new" class="btn btn-primary" id="add-menu-item-btn">
          + {{ 'MENU.ADD' | translate }}
        </a>
      </div>

      <!-- Filter -->
      <div class="filter-bar">
        <input type="text" class="form-control" [(ngModel)]="filterText"
               id="ingredient-filter"
               [placeholder]="'MENU.FILTER' | translate"
               (input)="onFilterChange()" />
        @if (filterText) {
          <button class="btn btn-ghost" id="clear-filter-btn" (click)="clearFilter()">✕</button>
        }
      </div>

      <div class="container" style="padding-top:16px;">
        @if (loading()) {
          @for (i of [1,2,3]; track i) {
            <div class="skeleton" style="height:100px;margin-bottom:12px;"></div>
          }
        } @else if (items().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">🍜</div>
            <h3>{{ 'MENU.EMPTY' | translate }}</h3>
          </div>
        } @else {
          @for (item of items(); track item.id) {
            <div class="card" style="margin-bottom:12px;">
              <div class="flex justify-between items-center">
                <h3>{{ item.name }}</h3>
                <div class="flex gap-2">
                  <a [routerLink]="['/menu', item.id, 'edit']" class="btn btn-ghost btn-icon" [title]="'MENU.EDIT' | translate">
                    ✏️
                  </a>
                  <button class="btn btn-ghost btn-icon" (click)="deleteItem(item)" [title]="'MENU.DELETE' | translate">
                    🗑️
                  </button>
                </div>
              </div>

              @if (item.description) {
                <p class="text-muted text-sm" style="margin-top:4px;">{{ item.description }}</p>
              }

              <div class="chips-row">
                @for (ing of item.ingredients; track ing.id) {
                  <span class="chip">🌿 {{ ing.name }}</span>
                }
                @if (item.ingredients.length === 0) {
                  <span class="text-muted text-xs">{{ 'MENU.NO_INGREDIENTS' | translate }}</span>
                }
              </div>

              <div class="flex gap-2 mt-4">
                <a [routerLink]="['/menu', item.id]" class="btn btn-secondary" style="flex:1;font-size:0.85rem;">
                  {{ 'MENU.SCHEDULE' | translate }}
                </a>
                <span class="text-muted text-xs" style="align-self:center;">
                  {{ 'MENU.ADDED_BY' | translate }}: {{ item.createdBy?.name }}
                </span>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `
})
export class MenuListComponent implements OnInit, OnDestroy {
  items = signal<MenuItem[]>([]);
  loading = signal(true);
  filterText = '';
  private sseSubscription?: Subscription;

  constructor(private menuItemService: MenuItemService, private sseService: SseService) {}

  ngOnInit(): void {
    this.loadItems();
    this.sseSubscription = this.sseService.events$.subscribe(event => {
      if (['MENU_ITEM_CREATED','MENU_ITEM_UPDATED','MENU_ITEM_DELETED'].includes(event.type)) {
        this.loadItems();
      }
    });
  }

  ngOnDestroy(): void {
    this.sseSubscription?.unsubscribe();
  }

  loadItems(): void {
    this.menuItemService.getAll(this.filterText || undefined).subscribe({
      next: items => { this.items.set(items); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onFilterChange(): void {
    this.loadItems();
  }

  clearFilter(): void {
    this.filterText = '';
    this.loadItems();
  }

  deleteItem(item: MenuItem): void {
    if (!confirm(`Delete "${item.name}"?`)) return;
    this.menuItemService.delete(item.id).subscribe(() => this.loadItems());
  }
}
