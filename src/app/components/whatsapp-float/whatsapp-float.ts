import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ContactService } from '../../services/contact.service';
import { ContactInfo } from '../../models/models';
import { formatWhatsAppUrl } from '../../utils/contact.utils';

@Component({
  selector: 'app-whatsapp-float',
  standalone: true,
  templateUrl: './whatsapp-float.html',
  styleUrl: './whatsapp-float.scss'
})
export class WhatsappFloatComponent implements OnInit {
  private readonly contactService = inject(ContactService);
  private readonly cdr = inject(ChangeDetectorRef);

  contactInfo: ContactInfo | null = null;
  readonly inquiryMsg = 'Hello! I have a quick inquiry regarding your sports products.';

  ngOnInit(): void {
    this.contactService.getContactInfo().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.contactInfo = res.data;
          this.cdr.markForCheck();
        }
      },
      error: () => this.cdr.markForCheck()
    });
  }

  get whatsappUrl(): string {
    return formatWhatsAppUrl(this.contactInfo?.phone, this.inquiryMsg);
  }
}
