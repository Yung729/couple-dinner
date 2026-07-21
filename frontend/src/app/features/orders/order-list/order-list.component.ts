import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { OrderService } from '../../../core/order.service';
import { SseService } from '../../../core/sse.service';
import { Order, OrderStatus } from '../../../shared/models/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe, DatePipe],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ 'ORDERS.TITLE' | translate }}</h1>
        <a routerLink="/orders/new" class="btn btn-primary" id="add-order-btn">
          + {{ 'ORDERS.ADD' | translate }}
        </a>
      </div>

      <div class="filter-bar mb-4" style="justify-content:flex-end;">
        <label class="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" [(ngModel)]="showAll" (change)="loadOrders()" id="show-all-orders-cb" />
          {{ 'ORDERS.ALL' | translate }}
        </label>
      </div>

      <div class="container">
        @if (loading()) {
          @for (i of [1,2]; track i) {
            <div class="skeleton" style="height:120px;margin-bottom:12px;"></div>
          }
        } @else if (orders().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">📅</div>
            <h3>{{ 'ORDERS.EMPTY' | translate }}</h3>
          </div>
        } @else {
          @for (order of orders(); track order.id) {
            <div class="card" style="margin-bottom:12px; position:relative; overflow:hidden;">
              <!-- Colored side strip based on status -->
              <div style="position:absolute; left:0; top:0; bottom:0; width:4px;"
                   [ngStyle]="{'background-color': getStatusColor(order.status)}"></div>
              
              <div class="flex justify-between items-center pl-2">
                <h3>{{ order.menuItem?.name || 'Deleted Item' }}</h3>
                <span class="badge" [ngClass]="'badge-' + order.status.toLowerCase()">
                  {{ 'ORDERS.STATUS.' + order.status | translate }}
                </span>
              </div>

              <div class="order-meta pl-2 mt-4 text-sm">
                <span style="display:flex;align-items:center;gap:4px;">
                  🗓️ {{ order.scheduledTime | date:'medium' }}
                </span>
                <span class="text-muted" style="margin-left:auto;">
                  {{ 'ORDERS.REQUESTED_BY' | translate }}: {{ order.requestedBy?.name }}
                </span>
              </div>

              <div class="divider"></div>

              <div class="flex gap-2 pl-2">
                <select class="form-control status-select" [ngModel]="order.status"
                        (ngModelChange)="updateStatus(order, $event)"
                        style="min-height:36px; padding:6px 30px 6px 12px; font-size:0.85rem;"
                        [disabled]="order.status === 'CANCELLED'">
                  <option value="PLANNED">{{ 'ORDERS.STATUS.PLANNED' | translate }}</option>
                  <option value="CONFIRMED">{{ 'ORDERS.STATUS.CONFIRMED' | translate }}</option>
                  <option value="COMPLETED">{{ 'ORDERS.STATUS.COMPLETED' | translate }}</option>
                </select>

                @if (order.status !== 'CANCELLED') {
                  <button class="btn btn-danger" style="flex:1; min-height:36px; font-size:0.85rem;"
                          (click)="cancelOrder(order)">
                    {{ 'ORDERS.CANCEL' | translate }}
                  </button>
                }
              </div>
            </div>
          }
        }
      </div>
    </div>
  `
})
export class OrderListComponent implements OnInit, OnDestroy {
  orders = signal<Order[]>([]);
  loading = signal(true);
  showAll = false;
  private sseSubscription?: Subscription;

  constructor(private orderService: OrderService, private sseService: SseService) {}

  ngOnInit(): void {
    this.loadOrders();
    this.sseSubscription = this.sseService.events$.subscribe(event => {
      if (['ORDER_CREATED','ORDER_UPDATED','ORDER_CANCELLED'].includes(event.type)) {
        this.loadOrders();
      }
    });
  }

  ngOnDestroy(): void {
    this.sseSubscription?.unsubscribe();
  }

  loadOrders(): void {
    const req = this.showAll ? this.orderService.getAll() : this.orderService.getUpcoming();
    req.subscribe({
      next: o => { this.orders.set(o); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  updateStatus(order: Order, newStatus: OrderStatus): void {
    if (order.status === newStatus) return;
    this.orderService.updateStatus(order.id, newStatus).subscribe();
  }

  cancelOrder(order: Order): void {
    if (!confirm('Cancel this order?')) return;
    this.orderService.cancel(order.id).subscribe();
  }

  getStatusColor(status: OrderStatus): string {
    switch (status) {
      case 'PLANNED': return 'var(--color-info)';
      case 'CONFIRMED': return 'var(--color-success)';
      case 'COMPLETED': return 'var(--color-primary)';
      case 'CANCELLED': return '#888';
      default: return 'transparent';
    }
  }
}
