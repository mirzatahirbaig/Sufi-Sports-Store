import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { ApiResponse, Article, PagedList } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private readonly api = inject(ApiService);

  getArticles(pageNumber: number = 1, pageSize: number = 6): Observable<ApiResponse<PagedList<Article>>> {
    let params = new HttpParams()
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString());
    return this.api.get<ApiResponse<PagedList<Article>>>('/api/v1/articles', params);
  }

  getArticleBySlug(slug: string): Observable<ApiResponse<Article>> {
    return this.api.get<ApiResponse<Article>>(`/api/v1/articles/${slug}`);
  }
}
