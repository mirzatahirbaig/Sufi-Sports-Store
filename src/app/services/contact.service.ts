import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, ContactInfo, SubmitContactMessageCommand } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly api = inject(ApiService);

  getContactInfo(): Observable<ApiResponse<ContactInfo>> {
    return this.api.get<ApiResponse<ContactInfo>>('/api/v1/contact-info');
  }

  submitMessage(command: SubmitContactMessageCommand): Observable<ApiResponse<any>> {
    return this.api.post<ApiResponse<any>>('/api/v1/contact', command);
  }
}
