import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ContactService } from '../../services/contact.service';
import { ContactInfo } from '../../models/models';
import { formatWhatsAppUrl } from '../../utils/contact.utils';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class ContactComponent implements OnInit {
  private readonly contactService = inject(ContactService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cdr = inject(ChangeDetectorRef);

  contactInfo: ContactInfo | null = null;

  ngOnInit(): void {
    this.contactService.getContactInfo().subscribe({
      next: (res) => {
        if (res.success) this.contactInfo = res.data;
        this.cdr.markForCheck();
      },
      error: () => this.cdr.markForCheck()
    });
  }

  getWhatsAppUrl(phone?: string | null): string {
    return formatWhatsAppUrl(phone);
  }

  get mapUrl(): SafeResourceUrl {
    const lat = this.contactInfo?.latitude || 32.4972;
    const lng = this.contactInfo?.longitude || 74.4646;
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`
    );
  }
}
