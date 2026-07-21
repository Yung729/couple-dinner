import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth.service';
import { AuthResponse } from '../../../shared/models/models';

@Component({
  selector: 'app-invite',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, TranslateDirective],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">🎉</div>
        <h1 class="auth-title">{{ 'AUTH.PAIR_SUCCESS' | translate }}</h1>
        <p class="auth-subtitle">{{ 'AUTH.INVITE_SHARE' | translate }}</p>

        <div class="invite-code-display">
          <p class="text-muted text-sm">Your invite code</p>
          <div class="invite-code" id="invite-code-display">{{ inviteCode() || '--------' }}</div>
          <button class="btn btn-secondary" id="copy-invite-btn" (click)="copyCode()" style="margin-top:8px;">
            {{ copied() ? ('AUTH.COPIED' | translate) : ('AUTH.COPY_CODE' | translate) }}
          </button>
        </div>

        <div style="background:var(--color-surface2);border-radius:var(--radius-md);padding:16px;margin:16px 0;text-align:center;">
          <p class="text-muted text-sm">{{ 'AUTH.INVITE_WAITING' | translate }}</p>
          <div style="margin-top:8px;font-size:1.5rem;">⏳</div>
        </div>

        <a routerLink="/menu" class="btn btn-primary btn-block" id="go-to-menu">
          Continue to Menu →
        </a>
      </div>
    </div>
  `
})
export class InviteComponent implements OnInit {
  inviteCode = signal('');
  copied = signal(false);

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.refreshMe().subscribe({
      next: (res: AuthResponse) => {
        if (res.inviteCode) this.inviteCode.set(res.inviteCode);
      }
    });
  }

  copyCode(): void {
    const code = this.inviteCode();
    if (code) {
      navigator.clipboard.writeText(code).then(() => {
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
      });
    }
  }
}
