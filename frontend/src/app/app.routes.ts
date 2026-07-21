import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/menu', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'join',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/join/join.component').then(m => m.JoinComponent)
  },
  {
    path: 'invite',
    canActivate: [authGuard],
    loadComponent: () => import('./features/auth/invite/invite.component').then(m => m.InviteComponent)
  },
  {
    path: 'menu',
    canActivate: [authGuard],
    loadComponent: () => import('./features/menu/menu-list/menu-list.component').then(m => m.MenuListComponent)
  },
  {
    path: 'menu/new',
    canActivate: [authGuard],
    loadComponent: () => import('./features/menu/menu-form/menu-form.component').then(m => m.MenuFormComponent)
  },
  {
    path: 'menu/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/menu/menu-detail/menu-detail.component').then(m => m.MenuDetailComponent)
  },
  {
    path: 'menu/:id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./features/menu/menu-form/menu-form.component').then(m => m.MenuFormComponent)
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () => import('./features/orders/order-list/order-list.component').then(m => m.OrderListComponent)
  },
  {
    path: 'orders/new',
    canActivate: [authGuard],
    loadComponent: () => import('./features/orders/order-form/order-form.component').then(m => m.OrderFormComponent)
  },
  {
    path: 'fridge',
    canActivate: [authGuard],
    loadComponent: () => import('./features/fridge/fridge.component').then(m => m.FridgeComponent)
  },
  { path: '**', redirectTo: '/menu' }
];
