import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ContactService } from '../../services/contact.service';
import { SubmitContactMessageCommand } from '../../models/models';

@Component({
  selector: 'app-request-quote',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './request-quote.html',
  styleUrl: './request-quote.scss'
})
export class RequestQuoteComponent implements OnInit {
  private readonly contactService = inject(ContactService);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  formModel: SubmitContactMessageCommand = { name: '', email: '', phone: '', message: '' };
  isSubmitting = false;
  submitSuccess = false;
  submitError = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['product']) {
        this.formModel.message = `Hello Sufi Sports Factory Team,\n\nI would like to request a custom quotation for product: "${params['product']}".\n\nCustomization Details:\n- Estimated Quantity:\n- Custom Branding & Printing:\n- Preferred Colors & Specs:\n\nPlease send custom pricing, production lead time, and sample details.`;
      }
    });
  }

  onSubmit(): void {
    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = '';

    this.contactService.submitMessage(this.formModel).subscribe({
      next: (res) => this.handleSuccess(res.success, res.message),
      error: (err) => this.handleError(err)
    });
  }

  private handleSuccess(success: boolean, message?: string): void {
    if (success) {
      this.submitSuccess = true;
      this.formModel = { name: '', email: '', phone: '', message: '' };
    } else {
      this.submitError = message || 'Submission failed. Please try again.';
    }
    this.isSubmitting = false;
    this.cdr.markForCheck();
  }

  private handleError(err: { status?: number }): void {
    this.submitError = err.status === 429
      ? 'Rate limit exceeded. Please wait a moment.'
      : 'Failed to send quote request. Please try again.';
    this.isSubmitting = false;
    this.cdr.markForCheck();
  }
}
