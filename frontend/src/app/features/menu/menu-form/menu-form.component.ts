import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { MenuItemService } from '../../../core/menu-item.service';
import { FridgeService } from '../../../core/fridge.service';
import { MenuItem } from '../../../shared/models/models';

@Component({
  selector: 'app-menu-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe, TranslateDirective],
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
            <label class="form-label">{{ 'MENU.INGREDIENTS' | translate }}</label>
            <div class="chips-row" style="margin-bottom:10px;">
              @for (ing of ingredients; track ing) {
                <span class="chip">
                  🌿 {{ ing }}
                  <button type="button" class="chip-remove" (click)="removeIngredient(ing)">×</button>
                </span>
              }
            </div>
            <div class="add-ingredient-row">
              <input type="text" class="form-control" [(ngModel)]="newIngredient" name="newIngredient"
                     id="add-ingredient-input" list="fridge-ingredients" autocomplete="off"
                     [placeholder]="'MENU.INGREDIENT_PLACEHOLDER' | translate"
                     (keydown.enter)="$event.preventDefault(); addIngredient()" />
              <datalist id="fridge-ingredients">
                @for (ing of availableFridgeItems; track ing) {
                  <option [value]="ing"></option>
                }
              </datalist>
              <button type="button" class="btn btn-secondary" id="add-ingredient-btn" (click)="addIngredient()">+</button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-block" id="save-menu-item-btn" [disabled]="loading()">
            @if (loading()) { ⏳ } @else { {{ 'MENU.SAVE' | translate }} }
          </button>
        </form>
      </div>
    </div>
  `
})
export class MenuFormComponent implements OnInit {
  name = '';
  description = '';
  ingredients: string[] = [];
  newIngredient = '';
  isEdit = signal(false);
  loading = signal(false);
  error = signal('');
  availableFridgeItems: string[] = [];
  private itemId = '';

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
        this.ingredients = item.ingredients.map(i => i.name);
      });
    }

    this.fridgeService.getAll().subscribe(items => {
      // Get unique ingredient names from fridge
      this.availableFridgeItems = Array.from(new Set(items.map(i => i.ingredientName.toLowerCase())));
    });
  }

  addIngredient(): void {
    const ing = this.newIngredient.trim().toLowerCase();
    if (ing && !this.ingredients.includes(ing)) {
      this.ingredients.push(ing);
    }
    this.newIngredient = '';
  }

  removeIngredient(ing: string): void {
    this.ingredients = this.ingredients.filter(i => i !== ing);
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
