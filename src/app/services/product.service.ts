import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { ApiResponse, PagedList, Product } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly api = inject(ApiService);

  getProducts(filters: {
    pageNumber?: number;
    pageSize?: number;
    isFeatured?: boolean;
    category?: string;
    searchTerm?: string;
    isActive?: boolean;
  }): Observable<ApiResponse<PagedList<Product>>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        const paramKey = key.charAt(0).toUpperCase() + key.slice(1);
        params = params.set(paramKey, val.toString());
      }
    });
    return this.api.get<ApiResponse<PagedList<Product>>>('/api/v1/products', params);
  }

  getProductById(id: number): Observable<ApiResponse<Product>> {
    return this.api.get<ApiResponse<Product>>(`/api/v1/products/${id}`);
  }
}
