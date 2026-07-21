import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MenuItem, MenuItemRequest, MissingIngredientsResponse } from '../shared/models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MenuItemService {
  private base = `${environment.apiUrl}/api/menu-items`;

  constructor(private http: HttpClient) {}

  getAll(ingredientFilter?: string): Observable<MenuItem[]> {
    let params = new HttpParams();
    if (ingredientFilter) params = params.set('ingredient', ingredientFilter);
    return this.http.get<MenuItem[]>(this.base, { params });
  }

  getById(id: string): Observable<MenuItem> {
    return this.http.get<MenuItem>(`${this.base}/${id}`);
  }

  create(req: MenuItemRequest): Observable<MenuItem> {
    return this.http.post<MenuItem>(this.base, req);
  }

  update(id: string, req: MenuItemRequest): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.base}/${id}`, req);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  addIngredient(menuItemId: string, name: string): Observable<MenuItem> {
    return this.http.post<MenuItem>(`${this.base}/${menuItemId}/ingredients`, { name });
  }

  removeIngredient(menuItemId: string, ingredientId: string): Observable<MenuItem> {
    return this.http.delete<MenuItem>(`${this.base}/${menuItemId}/ingredients/${ingredientId}`);
  }

  checkMissingIngredients(menuItemId: string): Observable<MissingIngredientsResponse> {
    return this.http.get<MissingIngredientsResponse>(`${this.base}/${menuItemId}/missing-ingredients`);
  }
}
