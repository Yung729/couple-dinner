import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateDirective, TranslateService } from '@ngx-translate/core';
import { MenuItemService } from '../../../core/menu-item.service';
import { MenuItem, MissingIngredientsResponse } from '../../../shared/models/models';

@Component({
  selector: 'app-menu-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe, TranslateDirective],
  template: `
    <div class="page">
      <div class="page-header">
        <a routerLink="/menu" class="btn btn-ghost">← {{ 'COMMON.BACK' | translate }}</a>
        <h1>{{ 'MENU.SCHEDULE' | translate }}</h1>
        <div style="width:60px;"></div>
      </div>

      <div class="container">
        @if (loading()) {
          <div class="skeleton" style="height:200px;"></div>
        } @else if (item()) {
          <div class="card" style="margin-bottom:16px;">
            <h2>{{ item()!.name }}</h2>
            @if (item()!.description) {
              <p class="text-muted mt-4">{{ item()!.description }}</p>
            }

            <h3 class="mt-6 mb-4">{{ 'MENU.INGREDIENTS' | translate }}</h3>
            <div class="chips-row">
              @for (ing of item()!.ingredients; track ing.id) {
                <span class="chip">🌿 {{ ing.name }}</span>
              }
              @if (item()!.ingredients.length === 0) {
                <span class="text-muted">{{ 'MENU.NO_INGREDIENTS' | translate }}</span>
              }
            </div>
          </div>

          <button class="btn btn-primary btn-block" id="check-fridge-btn" (click)="checkFridge()" [disabled]="checking()">
            @if (checking()) { ⏳ } @else { 🔍 {{ 'MENU.CHECK_FRIDGE' | translate }} }
          </button>
        }

        <!-- Missing Ingredients Modal -->
        @if (missingResponse()) {
          <div class="modal-backdrop" id="missing-modal-backdrop">
            <div class="modal">
              <h3 class="modal-title">{{ (missingResponse()!.missing.length > 0 ? 'MISSING.TITLE' : 'MISSING.ALL_GOOD') | translate }}</h3>
              
              @if (missingResponse()!.missing.length > 0) {
                <p class="mb-4" style="font-size:1.1rem; line-height:1.5;">
                  {{ currentLang === 'zh-hans' ? missingResponse()!.messageZh : missingResponse()!.messageEn }}
                </p>
                <div class="mb-4" style="background:var(--color-surface2);padding:12px;border-radius:var(--radius-md);">
                  <strong class="text-sm text-muted">{{ 'MISSING.MISSING_LIST' | translate }}</strong>
                  <ul style="margin-top:8px;padding-left:20px;color:var(--color-danger);">
                    @for (m of missingResponse()!.missing; track m) {
                      <li>{{ m }}</li>
                    }
                  </ul>
                </div>
              }

              <div class="modal-actions">
                <button class="btn btn-secondary" id="modal-cancel-btn" (click)="closeModal()">
                  {{ (missingResponse()!.missing.length > 0 ? 'MISSING.GO_SHOPPING' : 'COMMON.CLOSE') | translate }}
                </button>
                <button class="btn btn-primary" id="modal-proceed-btn" (click)="proceedToSchedule()">
                  {{ (missingResponse()!.missing.length > 0 ? 'MISSING.PROCEED' : 'ORDERS.ADD') | translate }}
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class MenuDetailComponent implements OnInit {
  item = signal<MenuItem | null>(null);
  loading = signal(true);
  checking = signal(false);
  missingResponse = signal<MissingIngredientsResponse | null>(null);

  get currentLang(): string {
    return this.translate.currentLang() || 'en';
  }

  constructor(
    private menuItemService: MenuItemService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.menuItemService.getById(id).subscribe({
        next: i => { this.item.set(i); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    }
  }

  checkFridge(): void {
    const it = this.item();
    if (!it) return;
    this.checking.set(true);
    this.menuItemService.checkMissingIngredients(it.id).subscribe({
      next: res => {
        this.missingResponse.set(res);
        this.checking.set(false);
      },
      error: () => this.checking.set(false)
    });
  }

  closeModal(): void {
    this.missingResponse.set(null);
  }

  proceedToSchedule(): void {
    const it = this.item();
    if (it) {
      this.router.navigate(['/orders/new'], { queryParams: { menuItemId: it.id } });
    }
  }
}
