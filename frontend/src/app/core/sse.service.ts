import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { SseEvent } from '../shared/models/models';
import { environment } from '../../environments/environment';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
}

@Injectable({ providedIn: 'root' })
export class SseService {
  private eventSource: EventSource | null = null;
  events$ = new Subject<SseEvent>();
  toasts = signal<ToastMessage[]>([]);

  constructor(private authService: AuthService) {}

  connect(): void {
    if (this.eventSource) return;
    const token = this.authService.getToken();
    if (!token) return;

    const url = `${environment.apiUrl}/api/events/stream?token=${encodeURIComponent(token)}`;
    this.eventSource = new EventSource(url);

    this.eventSource.onmessage = (event) => {
      try {
        const parsed: SseEvent = JSON.parse(event.data);
        this.events$.next(parsed);
      } catch (e) {
        // ignore parse errors (heartbeat comments won't have data)
      }
    };

    this.eventSource.onerror = () => {
      this.disconnect();
      // Auto-reconnect after 5 seconds
      setTimeout(() => this.connect(), 5000);
    };
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  showToast(message: string, type: 'info' | 'success' | 'warning' = 'info'): void {
    const id = Date.now().toString();
    this.toasts.update(toasts => [...toasts, { id, message, type }]);
    setTimeout(() => {
      this.toasts.update(toasts => toasts.filter(t => t.id !== id));
    }, 4000);
  }

  dismissToast(id: string): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }
}
