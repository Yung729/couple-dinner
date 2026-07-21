import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateDirective, TranslateService } from '@ngx-translate/core';
import { AuthService } from './core/auth.service';
import { SseService } from './core/sse.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, TranslatePipe, TranslateDirective],
  template: `
    <!-- Toast Container -->
    <div class="toast-container">
      @for (toast of sseService.toasts(); track toast.id) {
        <div class="toast" [class]="toast.type" (click)="sseService.dismissToast(toast.id)">
          <span>{{ toast.message }}</span>
        </div>
      }
    </div>

    @if (authService.isLoggedIn()) {
      <!-- App Header -->
      <header class="app-header">
        <a routerLink="/menu" class="logo">{{ 'APP_NAME' | translate }}</a>
        <div class="header-actions">
          <!-- Desktop nav -->
          <nav class="desktop-nav">
            <a routerLink="/menu" routerLinkActive="active">{{ 'NAV.MENU' | translate }}</a>
            <a routerLink="/orders" routerLinkActive="active">{{ 'NAV.ORDERS' | translate }}</a>
            <a routerLink="/fridge" routerLinkActive="active">{{ 'NAV.FRIDGE' | translate }}</a>
          </nav>
          
          @if (authService.inviteCode()) {
            <div class="invite-badge" style="background:var(--color-primary); color:white; padding:4px 10px; border-radius:12px; font-weight:bold; font-size:0.85rem; cursor:pointer; margin-right:8px;" (click)="copyInviteCode()" title="Copy Invite Code">
              Code: {{ authService.inviteCode() }} 📋
            </div>
          }

          <button class="lang-toggle" (click)="toggleLang()" id="lang-toggle-btn">
            {{ 'LANG' | translate }}
          </button>
          <button class="btn btn-ghost btn-icon" (click)="authService.logout()" title="Logout" id="logout-btn">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </header>

      <!-- Main content -->
      <main>
        <router-outlet></router-outlet>
      </main>

      <!-- Bottom Nav (mobile) -->
      <nav class="bottom-nav">
        <a routerLink="/menu" routerLinkActive="active" id="nav-menu">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <span>{{ 'NAV.MENU' | translate }}</span>
        </a>
        <a routerLink="/orders" routerLinkActive="active" id="nav-orders">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <span>{{ 'NAV.ORDERS' | translate }}</span>
        </a>
        <a routerLink="/fridge" routerLinkActive="active" id="nav-fridge">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
          <span>{{ 'NAV.FRIDGE' | translate }}</span>
        </a>
      </nav>
    } @else {
      <!-- No nav for auth pages -->
      <router-outlet></router-outlet>
    }
  `
})
export class AppComponent implements OnInit, OnDestroy {
  private sseSubscription?: Subscription;
  private currentLang = 'en';

  constructor(
    public authService: AuthService,
    public sseService: SseService,
    private translate: TranslateService
  ) {
    const savedLang = localStorage.getItem('cd_lang') || 'en';
    this.currentLang = savedLang;
    translate.use(savedLang);
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.authService.refreshMe().subscribe();
      this.sseService.connect();
      this.listenToSseEvents();
    }
  }

  ngOnDestroy(): void {
    this.sseSubscription?.unsubscribe();
    this.sseService.disconnect();
  }

  toggleLang(): void {
    const newLang = this.currentLang === 'en' ? 'zh-hans' : 'en';
    this.currentLang = newLang;
    localStorage.setItem('cd_lang', newLang);
    this.translate.use(newLang);
  }

  copyInviteCode(): void {
    const code = this.authService.inviteCode();
    if (code) {
      navigator.clipboard.writeText(code).then(() => {
        this.sseService.showToast(this.currentLang === 'zh-hans' ? '邀请码已复制！' : 'Invite code copied!');
      });
    }
  }

  private listenToSseEvents(): void {
    const partnerName = this.authService.currentPartner()?.name || 'Partner';
    this.sseSubscription = this.sseService.events$.subscribe(event => {
      const lang = this.currentLang;
      let msg = '';
      const payload = event.payload;
      const itemName = payload?.name || payload?.menuItem?.name || payload?.ingredientName || '';

      switch (event.type) {
        case 'MENU_ITEM_CREATED': msg = lang === 'zh-hans'
          ? `${partnerName} 添加了新菜品：${itemName} 🍜`
          : `${partnerName} added a new dish: ${itemName} 🍜`; break;
        case 'MENU_ITEM_UPDATED': msg = lang === 'zh-hans'
          ? `${partnerName} 更新了菜品 🔄`
          : `${partnerName} updated a dish 🔄`; break;
        case 'MENU_ITEM_DELETED': msg = lang === 'zh-hans'
          ? `${partnerName} 删除了菜品`
          : `${partnerName} removed a dish`; break;
        case 'ORDER_CREATED': msg = lang === 'zh-hans'
          ? `${partnerName} 安排了 ${itemName} 🍽️`
          : `${partnerName} scheduled ${itemName} 🍽️`; break;
        case 'ORDER_UPDATED': msg = lang === 'zh-hans'
          ? `${partnerName} 更新了订单状态`
          : `${partnerName} updated an order status`; break;
        case 'ORDER_CANCELLED': msg = lang === 'zh-hans'
          ? `${partnerName} 取消了订单`
          : `${partnerName} cancelled an order`; break;
        case 'FRIDGE_ITEM_ADDED': msg = lang === 'zh-hans'
          ? `${partnerName} 向冰箱添加了 ${itemName} 🧊`
          : `${partnerName} added ${itemName} to the fridge 🧊`; break;
        case 'FRIDGE_ITEM_UPDATED': msg = lang === 'zh-hans'
          ? `${partnerName} 更新了冰箱`
          : `${partnerName} updated the fridge`; break;
        case 'FRIDGE_ITEM_DELETED': msg = lang === 'zh-hans'
          ? `${partnerName} 从冰箱删除了食材`
          : `${partnerName} removed a fridge item`; break;
      }
      if (msg) this.sseService.showToast(msg);
    });
  }
}
