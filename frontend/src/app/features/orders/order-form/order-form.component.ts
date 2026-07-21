import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { MenuItemService } from '../../../core/menu-item.service';
import { OrderService } from '../../../core/order.service';
import { MenuItem } from '../../../shared/models/models';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe, TranslateDirective],
  template: `
    <div class="page">
      <div class="page-header">
        <a routerLink="/orders" class="btn btn-ghost">← {{ 'COMMON.BACK' | translate }}</a>
        <h1>{{ 'ORDERS.ADD' | translate }}</h1>
        <div style="width:60px;"></div>
      </div>

      <div class="container">
        @if (error()) {
          <div class="form-error mb-4" style="padding:10px;background:rgba(239,68,68,.1);border-radius:10px;">{{ error() }}</div>
        }

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">{{ 'ORDERS.CHOOSE_DISH' | translate }}</label>
            <select class="form-control" [(ngModel)]="menuItemId" name="menuItemId" required id="order-menu-item">
              <option value="" disabled>{{ 'ORDERS.CHOOSE_DISH' | translate }}</option>
              @for (item of menuItems(); track item.id) {
                <option [value]="item.id">{{ item.name }}</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">{{ 'ORDERS.SCHEDULE_TIME' | translate }}</label>
            <input type="datetime-local" class="form-control" [(ngModel)]="scheduledTime" name="scheduledTime"
                   id="order-time" required />
          </div>

          <button type="submit" class="btn btn-primary btn-block mt-4" id="save-order-btn" [disabled]="loading()">
            @if (loading()) { ⏳ } @else { {{ 'ORDERS.SAVE' | translate }} }
          </button>
        </form>
      </div>
    </div>
  `
})
export class OrderFormComponent implements OnInit {
  menuItems = signal<MenuItem[]>([]);
  menuItemId = '';
  scheduledTime = '';
  loading = signal(false);
  error = signal('');

  constructor(
    private menuItemService: MenuItemService,
    private orderService: OrderService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // default to tomorrow at dinner time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(19, 0, 0, 0);
    this.scheduledTime = tomorrow.toISOString().slice(0, 16);

    this.menuItemService.getAll().subscribe(items => {
      this.menuItems.set(items);
      const preselected = this.route.snapshot.queryParamMap.get('menuItemId');
      if (preselected && items.some(i => i.id === preselected)) {
        this.menuItemId = preselected;
      } else if (items.length > 0) {
        this.menuItemId = items[0].id;
      }
    });
  }

  onSubmit(): void {
    if (!this.menuItemId || !this.scheduledTime) return;
    this.loading.set(true);
    this.error.set('');

    const timeUtc = new Date(this.scheduledTime).toISOString();
    
    this.orderService.create({ menuItemId: this.menuItemId, scheduledTime: timeUtc }).subscribe({
      next: () => this.router.navigate(['/orders']),
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to schedule');
        this.loading.set(false);
      }
    });
  }
}
