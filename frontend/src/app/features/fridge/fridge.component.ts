import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { FridgeService } from '../../core/fridge.service';
import { SseService } from '../../core/sse.service';
import { FridgeItem, FridgeItemRequest } from '../../shared/models/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-fridge',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ 'FRIDGE.TITLE' | translate }}</h1>
        <button class="btn btn-primary" id="add-fridge-item-btn" (click)="openAddModal()">
          + {{ 'FRIDGE.ADD' | translate }}
        </button>
      </div>

      <div class="container">
        @if (loading()) {
          @for (i of [1,2,3]; track i) {
            <div class="skeleton" style="height:70px;margin-bottom:12px;"></div>
          }
        } @else if (items().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">🧊</div>
            <h3>{{ 'FRIDGE.EMPTY' | translate }}</h3>
          </div>
        } @else {
          @for (item of items(); track item.id) {
            <div class="card" style="margin-bottom:12px; padding:12px 16px;">
              <div class="flex justify-between items-center">
                <div>
                  <h3 style="margin-bottom:4px;">{{ item.ingredientName }}</h3>
                  <div class="text-xs text-muted">
                    {{ 'FRIDGE.ADDED_BY' | translate }}: {{ item.addedBy?.name }}
                  </div>
                </div>
                
                <div class="flex items-center gap-4">
                  <div class="fridge-qty">
                    <span>{{ item.quantity }}</span>
                    <span class="fridge-unit">{{ item.unit }}</span>
                  </div>
                  <div class="flex gap-2">
                    <button class="btn btn-ghost btn-icon" (click)="openEditModal(item)" style="width:36px;height:36px;">✏️</button>
                    <button class="btn btn-ghost btn-icon" (click)="deleteItem(item)" style="width:36px;height:36px;">🗑️</button>
                  </div>
                </div>
              </div>
            </div>
          }
        }
      </div>

      <!-- Add/Edit Modal -->
      @if (showModal()) {
        <div class="modal-backdrop">
          <div class="modal">
            <h3 class="modal-title">{{ (editingId() ? 'FRIDGE.EDIT' : 'FRIDGE.ADD') | translate }}</h3>
            
            <form (ngSubmit)="saveItem()" #f="ngForm">
              <div class="form-group">
                <label class="form-label">{{ 'FRIDGE.INGREDIENT' | translate }}</label>
                <input type="text" class="form-control" [(ngModel)]="formReq.ingredientName" name="name" required />
              </div>
              <div class="flex gap-3">
                <div class="form-group" style="flex:1;">
                  <label class="form-label">{{ 'FRIDGE.QUANTITY' | translate }}</label>
                  <input type="number" class="form-control" [(ngModel)]="formReq.quantity" name="qty" min="0.1" step="0.1" required />
                </div>
                <div class="form-group" style="flex:1;">
                  <label class="form-label">{{ 'FRIDGE.UNIT' | translate }}</label>
                  <input type="text" class="form-control" [(ngModel)]="formReq.unit" name="unit" [placeholder]="'FRIDGE.UNIT_PLACEHOLDER' | translate" />
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="closeModal()">{{ 'COMMON.CANCEL' | translate }}</button>
                <button type="submit" class="btn btn-primary" [disabled]="saving()">
                  @if (saving()) { ⏳ } @else { {{ 'FRIDGE.SAVE' | translate }} }
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class FridgeComponent implements OnInit, OnDestroy {
  items = signal<FridgeItem[]>([]);
  loading = signal(true);
  
  showModal = signal(false);
  editingId = signal<string | null>(null);
  saving = signal(false);
  
  formReq: FridgeItemRequest = { ingredientName: '', quantity: 1, unit: '' };
  private sseSubscription?: Subscription;

  constructor(private fridgeService: FridgeService, private sseService: SseService) {}

  ngOnInit(): void {
    this.loadItems();
    this.sseSubscription = this.sseService.events$.subscribe(event => {
      if (['FRIDGE_ITEM_ADDED','FRIDGE_ITEM_UPDATED','FRIDGE_ITEM_DELETED'].includes(event.type)) {
        this.loadItems();
      }
    });
  }

  ngOnDestroy(): void {
    this.sseSubscription?.unsubscribe();
  }

  loadItems(): void {
    this.fridgeService.getAll().subscribe({
      next: items => { this.items.set(items); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openAddModal(): void {
    this.formReq = { ingredientName: '', quantity: 1, unit: '' };
    this.editingId.set(null);
    this.showModal.set(true);
  }

  openEditModal(item: FridgeItem): void {
    this.formReq = { 
      ingredientName: item.ingredientName, 
      quantity: item.quantity, 
      unit: item.unit || '' 
    };
    this.editingId.set(item.id);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveItem(): void {
    if (!this.formReq.ingredientName || this.formReq.quantity <= 0) return;
    this.saving.set(true);
    
    const obs = this.editingId() 
      ? this.fridgeService.update(this.editingId()!, this.formReq)
      : this.fridgeService.add(this.formReq);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadItems();
      },
      error: () => this.saving.set(false)
    });
  }

  deleteItem(item: FridgeItem): void {
    if (!confirm(`Remove ${item.ingredientName} from fridge?`)) return;
    this.fridgeService.delete(item.id).subscribe({
      next: () => this.loadItems()
    });
  }
}
