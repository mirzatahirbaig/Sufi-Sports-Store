import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, Category } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly apiService = inject(ApiService);

  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.apiService.get<ApiResponse<Category[]>>('/categories');
  }
}
