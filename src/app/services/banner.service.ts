import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, Banner } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  private readonly api = inject(ApiService);

  getBanners(): Observable<ApiResponse<Banner[]>> {
    return this.api.get<ApiResponse<Banner[]>>('/api/v1/banners');
  }
}
