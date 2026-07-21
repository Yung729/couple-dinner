import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FridgeItem, FridgeItemRequest } from '../shared/models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FridgeService {
  private base = `${environment.apiUrl}/api/fridge`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<FridgeItem[]> {
    return this.http.get<FridgeItem[]>(this.base);
  }

  add(req: FridgeItemRequest): Observable<FridgeItem> {
    return this.http.post<FridgeItem>(this.base, req);
  }

  update(id: string, req: FridgeItemRequest): Observable<FridgeItem> {
    return this.http.put<FridgeItem>(`${this.base}/${id}`, req);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
