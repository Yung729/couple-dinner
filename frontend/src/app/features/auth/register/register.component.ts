import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth.service';
import { SseService } from '../../../core/sse.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe, TranslateDirective],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">💑</div>
        <h1 class="auth-title">{{ 'AUTH.REGISTER' | translate }}</h1>
        <p class="auth-subtitle">Be the first half of your couple account</p>

        @if (error()) {
          <div class="form-error mb-4" style="text-align:center;padding:10px;background:rgba(239,68,68,.1);border-radius:10px;">
            {{ error() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" #f="ngForm">
          <div class="form-group">
            <label class="form-label">{{ 'AUTH.NAME' | translate }}</label>
            <input type="text" class="form-control" [(ngModel)]="name" name="name"
                   id="reg-name" placeholder="Your name" required />
          </div>
          <div class="form-group">
            <label class="form-label">{{ 'AUTH.EMAIL' | translate }}</label>
            <input type="email" class="form-control" [(ngModel)]="email" name="email"
                   id="reg-email" placeholder="you@example.com" required />
          </div>
          <div class="form-group">
            <label class="form-label">{{ 'AUTH.PASSWORD' | translate }}</label>
            <input type="password" class="form-control" [(ngModel)]="password" name="password"
                   id="reg-password" placeholder="At least 6 characters" required />
          </div>
          <button type="submit" class="btn btn-primary btn-block" id="reg-submit" [disabled]="loading()">
            @if (loading()) { ⏳ } @else { {{ 'AUTH.REGISTER' | translate }} }
          </button>
        </form>

        <div class="divider"></div>
        <div class="text-center text-sm text-muted">
          {{ 'AUTH.HAVE_INVITE' | translate }}
          <a routerLink="/join" id="go-join" style="color: var(--color-primary); text-decoration:none; margin-left:4px;">
            {{ 'AUTH.JOIN' | translate }}
          </a>
        </div>
        <div class="text-center text-sm text-muted mt-4">
          <a routerLink="/login" id="go-login" style="color: var(--color-text-muted); text-decoration:none;">
            {{ 'AUTH.LOGIN_LINK' | translate }}
          </a>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(private authService: AuthService, private sseService: SseService, private router: Router) {}

  onSubmit(): void {
    if (!this.name || !this.email || !this.password) return;
    this.loading.set(true);
    this.error.set('');

    this.authService.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: () => {
        this.sseService.connect();
        this.router.navigate(['/invite']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Registration failed');
        this.loading.set(false);
      }
    });
  }
}
