import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth.service';
import { SseService } from '../../../core/sse.service';

@Component({
  selector: 'app-join',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">🔗</div>
        <h1 class="auth-title">{{ 'AUTH.JOIN' | translate }}</h1>
        <p class="auth-subtitle">Enter the invite code your partner shared with you</p>

        @if (error()) {
          <div class="form-error mb-4" style="text-align:center;padding:10px;background:rgba(239,68,68,.1);border-radius:10px;">
            {{ error() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" #f="ngForm">
          <div class="form-group">
            <label class="form-label">{{ 'AUTH.INVITE_CODE' | translate }}</label>
            <input type="text" class="form-control" [(ngModel)]="inviteCode" name="inviteCode"
                   id="join-invite-code"
                   placeholder="e.g. SUNSET42"
                   style="text-transform:uppercase;letter-spacing:0.15em;font-size:1.2rem;font-weight:700;"
                   maxlength="8" required />
          </div>
          <div class="form-group">
            <label class="form-label">{{ 'AUTH.NAME' | translate }}</label>
            <input type="text" class="form-control" [(ngModel)]="name" name="name"
                   id="join-name" placeholder="Your name" required />
          </div>
          <div class="form-group">
            <label class="form-label">{{ 'AUTH.EMAIL' | translate }}</label>
            <input type="email" class="form-control" [(ngModel)]="email" name="email"
                   id="join-email" placeholder="you@example.com" required />
          </div>
          <div class="form-group">
            <label class="form-label">{{ 'AUTH.PASSWORD' | translate }}</label>
            <input type="password" class="form-control" [(ngModel)]="password" name="password"
                   id="join-password" placeholder="At least 6 characters" required />
          </div>
          <button type="submit" class="btn btn-primary btn-block" id="join-submit" [disabled]="loading()">
            @if (loading()) { ⏳ } @else { {{ 'AUTH.JOIN' | translate }} }
          </button>
        </form>

        <div class="divider"></div>
        <div class="text-center text-sm text-muted">
          {{ 'AUTH.NO_INVITE' | translate }}
          <a routerLink="/register" id="go-register" style="color: var(--color-primary); text-decoration:none; margin-left:4px;">
            {{ 'AUTH.REGISTER' | translate }}
          </a>
        </div>
      </div>
    </div>
  `
})
export class JoinComponent {
  inviteCode = '';
  name = '';
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(private authService: AuthService, private sseService: SseService, private router: Router) {}

  onSubmit(): void {
    if (!this.inviteCode || !this.name || !this.email || !this.password) return;
    this.loading.set(true);
    this.error.set('');

    this.authService.join({
      inviteCode: this.inviteCode.toUpperCase(),
      name: this.name,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        this.sseService.connect();
        this.router.navigate(['/menu']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to join. Check your invite code.');
        this.loading.set(false);
      }
    });
  }
}
