import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth.service';
import { SseService } from '../../../core/sse.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">🍽️</div>
        <h1 class="auth-title">{{ 'APP_NAME' | translate }}</h1>
        <p class="auth-subtitle">{{ 'AUTH.WELCOME_BACK' | translate }}</p>

        @if (error()) {
          <div class="form-error mb-4" style="text-align:center;padding:10px;background:rgba(239,68,68,.1);border-radius:10px;">
            {{ error() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" #f="ngForm">
          <div class="form-group">
            <label class="form-label">{{ 'AUTH.EMAIL' | translate }}</label>
            <input type="email" class="form-control" [(ngModel)]="email" name="email"
                   id="login-email" placeholder="you@example.com" required />
          </div>
          <div class="form-group">
            <label class="form-label">{{ 'AUTH.PASSWORD' | translate }}</label>
            <input type="password" class="form-control" [(ngModel)]="password" name="password"
                   id="login-password" placeholder="••••••" required />
          </div>
          <button type="submit" class="btn btn-primary btn-block" id="login-submit" [disabled]="loading()">
            @if (loading()) { ⏳ } @else { {{ 'AUTH.LOGIN' | translate }} }
          </button>
        </form>

        <div class="divider"></div>
        <div class="text-center text-sm text-muted">
          {{ 'AUTH.REGISTER_LINK' | translate }}
          <a routerLink="/register" id="go-register" style="color: var(--color-primary); text-decoration:none; margin-left:4px;">
            {{ 'AUTH.REGISTER' | translate }}
          </a>
          &nbsp;/&nbsp;
          <a routerLink="/join" id="go-join" style="color: var(--color-primary); text-decoration:none;">
            {{ 'AUTH.JOIN' | translate }}
          </a>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(private authService: AuthService, private sseService: SseService, private router: Router) {}

  onSubmit(): void {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set('');

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.sseService.connect();
        this.router.navigate(['/menu']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Invalid email or password');
        this.loading.set(false);
      }
    });
  }
}
