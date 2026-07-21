import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, JoinRequest, User } from '../shared/models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'cd_token';
  private readonly USER_KEY = 'cd_user';
  private readonly PARTNER_KEY = 'cd_partner';
  private readonly INVITE_CODE_KEY = 'cd_invite_code';

  currentUser = signal<User | null>(this.loadUser());
  currentPartner = signal<User | null>(this.loadPartner());
  inviteCode = signal<string | null>(localStorage.getItem(this.INVITE_CODE_KEY));

  constructor(private http: HttpClient, private router: Router) {}

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/auth/register`, req).pipe(
      tap(res => this.handleAuthResponse(res))
    );
  }

  join(req: JoinRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/auth/join`, req).pipe(
      tap(res => this.handleAuthResponse(res))
    );
  }

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/auth/login`, req).pipe(
      tap(res => this.handleAuthResponse(res))
    );
  }

  refreshMe(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${environment.apiUrl}/api/auth/me`).pipe(
      tap(res => {
        if (res.user) this.saveUser(res.user);
        if (res.partner) this.savePartner(res.partner);
        this.currentUser.set(res.user);
        this.currentPartner.set(res.partner ?? null);
        this.setInviteCode(res.inviteCode ?? null);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.PARTNER_KEY);
    localStorage.removeItem(this.INVITE_CODE_KEY);
    this.currentUser.set(null);
    this.currentPartner.set(null);
    this.inviteCode.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private handleAuthResponse(res: AuthResponse): void {
    if (res.token) {
      localStorage.setItem(this.TOKEN_KEY, res.token);
    }
    if (res.user) {
      this.saveUser(res.user);
      this.currentUser.set(res.user);
    }
    if (res.partner) {
      this.savePartner(res.partner);
      this.currentPartner.set(res.partner);
    }
    this.setInviteCode(res.inviteCode ?? null);
  }

  private setInviteCode(code: string | null): void {
    if (code) {
      localStorage.setItem(this.INVITE_CODE_KEY, code);
    } else {
      localStorage.removeItem(this.INVITE_CODE_KEY);
    }
    this.inviteCode.set(code);
  }

  private saveUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private savePartner(partner: User): void {
    localStorage.setItem(this.PARTNER_KEY, JSON.stringify(partner));
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  private loadPartner(): User | null {
    const raw = localStorage.getItem(this.PARTNER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
