import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ContactService } from '../../services/contact.service';
import { ContactInfo, SubmitContactMessageCommand } from '../../models/models';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class ContactComponent implements OnInit {
  private readonly contactService = inject(ContactService);
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cdr = inject(ChangeDetectorRef);

  contactInfo: ContactInfo | null = null;
  formModel: SubmitContactMessageCommand = { name: '', email: '', phone: '', message: '' };

  get mapUrl(): SafeResourceUrl {
    const lat = this.contactInfo?.latitude || 32.4972;
    const lng = this.contactInfo?.longitude || 74.4646;
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`
    );
  }

  isSubmitting = false;
  submitSuccess = false;
  submitError = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['product']) {
        this.formModel.message = `Hello Sufi Sports Team,\n\nI would like to request a bulk order quotation and specifications for the product: "${params['product']}".\n\nPlease send me pricing and availability.`;
      }
    });

    this.contactService.getContactInfo().subscribe({
      next: (res) => {
        if (res.success) this.contactInfo = res.data;
        this.cdr.markForCheck();
      },
      error: () => this.cdr.markForCheck()
    });
  }

  onSubmit(): void {
    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = '';

    this.contactService.submitMessage(this.formModel).subscribe({
      next: (res) => {
        if (res.success) {
          this.submitSuccess = true;
          this.formModel = { name: '', email: '', phone: '', message: '' };
        } else {
          this.submitError = res.message || 'Submission failed. Please try again.';
        }
        this.isSubmitting = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.submitError = err.status === 429 ? 'Rate limit exceeded. Please wait a moment.' : 'Failed to send message. Please try again.';
        this.isSubmitting = false;
        this.cdr.markForCheck();
      }
    });
  }
}
