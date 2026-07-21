import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderRequest } from '../shared/models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private base = `${environment.apiUrl}/api/orders`;

  constructor(private http: HttpClient) {}

  getUpcoming(): Observable<Order[]> {
    return this.http.get<Order[]>(this.base);
  }

  getAll(): Observable<Order[]> {
    return this.http.get<Order[]>(this.base, { params: new HttpParams().set('all', 'true') });
  }

  create(req: OrderRequest): Observable<Order> {
    return this.http.post<Order>(this.base, req);
  }

  updateStatus(id: string, status: string): Observable<Order> {
    return this.http.put<Order>(`${this.base}/${id}/status`, { status });
  }

  cancel(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
