import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MenuItemService } from '../../../core/menu-item.service';
import { FridgeService } from '../../../core/fridge.service';
import { MenuItem, FridgeItemRequest } from '../../../shared/models/models';

@Component({
  selector: 'app-menu-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="page">
      <div class="page-header">
        <a routerLink="/menu" class="btn btn-ghost">← {{ 'COMMON.BACK' | translate }}</a>
        <h1>{{ (isEdit() ? 'MENU.EDIT' : 'MENU.ADD') | translate }}</h1>
        <div style="width:60px;"></div>
      </div>

      <div class="container">
        @if (error()) {
          <div class="form-error mb-4" style="padding:10px;background:rgba(239,68,68,.1);border-radius:10px;">{{ error() }}</div>
        }

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">{{ 'MENU.NAME' | translate }}</label>
            <input type="text" class="form-control" [(ngModel)]="name" name="name"
                   id="menu-name" [placeholder]="'MENU.NAME' | translate" required />
          </div>
          <div class="form-group">
            <label class="form-label">{{ 'MENU.DESCRIPTION' | translate }}</label>
            <textarea class="form-control" [(ngModel)]="description" name="description"
                      id="menu-description" rows="3"
                      [placeholder]="'MENU.DESCRIPTION' | translate" style="resize:vertical;"></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">{{ 'MENU.INGREDIENTS' | translate }} (Tap to select)</label>
            <div class="chips-row" style="margin-bottom:10px; gap:8px;">
              @for (ing of availableFridgeItems; track ing) {
                <span class="chip" 
                      [style.background]="ingredients.includes(ing) ? 'var(--color-primary)' : 'var(--color-surface2)'"
                      [style.color]="ingredients.includes(ing) ? '#fff' : 'var(--color-text)'"
                      [style.borderColor]="ingredients.includes(ing) ? 'var(--color-primary)' : 'var(--color-border)'"
                      (click)="toggleIngredient(ing)"
                      style="cursor:pointer; padding:8px 14px; font-weight:500;">
                  {{ ing }}
                </span>
              }
              
              <button type="button" class="btn btn-secondary" style="padding:4px 12px; height:auto; min-height:unset; border-radius:99px;" (click)="openFridgeModal()">
                + {{ 'FRIDGE.ADD' | translate }}
              </button>
            </div>
            @if (availableFridgeItems.length === 0) {
               <div class="text-sm text-muted mt-2">No ingredients in fridge yet.</div>
            }
          </div>

          <button type="submit" class="btn btn-primary btn-block" id="save-menu-item-btn" [disabled]="loading()">
            @if (loading()) { ⏳ } @else { {{ 'MENU.SAVE' | translate }} }
          </button>
        </form>
      </div>

      <!-- Add Fridge Item Modal -->
      @if (showFridgeModal()) {
        <div class="modal-backdrop">
          <div class="modal">
            <h3 class="modal-title">{{ 'FRIDGE.ADD' | translate }}</h3>
            <form (ngSubmit)="saveFridgeItem()" #f="ngForm">
              <div class="form-group">
                <label class="form-label">{{ 'FRIDGE.INGREDIENT' | translate }}</label>
                <input type="text" class="form-control" [(ngModel)]="fridgeFormReq.ingredientName" name="fname" required />
              </div>
              <div class="flex gap-3">
                <div class="form-group" style="flex:1;">
                  <label class="form-label">{{ 'FRIDGE.QUANTITY' | translate }}</label>
                  <input type="number" class="form-control" [(ngModel)]="fridgeFormReq.quantity" name="fqty" min="0.1" step="0.1" required />
                </div>
                <div class="form-group" style="flex:1;">
                  <label class="form-label">{{ 'FRIDGE.UNIT' | translate }}</label>
                  <input type="text" class="form-control" [(ngModel)]="fridgeFormReq.unit" name="funit" [placeholder]="'FRIDGE.UNIT_PLACEHOLDER' | translate" />
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="closeFridgeModal()">{{ 'COMMON.CANCEL' | translate }}</button>
                <button type="submit" class="btn btn-primary" [disabled]="savingFridge()">
                  @if (savingFridge()) { ⏳ } @else { {{ 'FRIDGE.SAVE' | translate }} }
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class MenuFormComponent implements OnInit {
  name = '';
  description = '';
  ingredients: string[] = [];
  isEdit = signal(false);
  loading = signal(false);
  error = signal('');
  availableFridgeItems: string[] = [];
  private itemId = '';

  // Fridge Modal State
  showFridgeModal = signal(false);
  savingFridge = signal(false);
  fridgeFormReq: FridgeItemRequest = { ingredientName: '', quantity: 1, unit: '' };

  constructor(
    private menuItemService: MenuItemService,
    private fridgeService: FridgeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.itemId = id;
      this.menuItemService.getById(id).subscribe(item => {
        this.name = item.name;
        this.description = item.description || '';
        this.ingredients = item.ingredients.map(i => i.name.toLowerCase());
      });
    }

    this.loadFridgeItems();
  }

  loadFridgeItems(): void {
    this.fridgeService.getAll().subscribe(items => {
      this.availableFridgeItems = Array.from(new Set(items.map(i => i.ingredientName.toLowerCase())));
    });
  }

  toggleIngredient(ing: string): void {
    if (this.ingredients.includes(ing)) {
      this.ingredients = this.ingredients.filter(i => i !== ing);
    } else {
      this.ingredients.push(ing);
    }
  }

  openFridgeModal(): void {
    this.fridgeFormReq = { ingredientName: '', quantity: 1, unit: '' };
    this.showFridgeModal.set(true);
  }

  closeFridgeModal(): void {
    this.showFridgeModal.set(false);
  }

  saveFridgeItem(): void {
    if (!this.fridgeFormReq.ingredientName || this.fridgeFormReq.quantity <= 0) return;
    this.savingFridge.set(true);
    
    this.fridgeService.add(this.fridgeFormReq).subscribe({
      next: (newItem) => {
        this.savingFridge.set(false);
        this.closeFridgeModal();
        const newIngName = newItem.ingredientName.toLowerCase();
        if (!this.ingredients.includes(newIngName)) {
           this.ingredients.push(newIngName);
        }
        this.loadFridgeItems();
      },
      error: () => this.savingFridge.set(false)
    });
  }

  onSubmit(): void {
    if (!this.name.trim()) return;
    this.loading.set(true);
    this.error.set('');

    const req = { name: this.name, description: this.description, ingredients: this.ingredients };
    const obs = this.isEdit()
      ? this.menuItemService.update(this.itemId, req)
      : this.menuItemService.create(req);

    obs.subscribe({
      next: () => this.router.navigate(['/menu']),
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to save');
        this.loading.set(false);
      }
    });
  }
}
