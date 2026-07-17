import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  private readonly cdr = inject(ChangeDetectorRef);

  contactInfo: ContactInfo | null = null;
  formModel: SubmitContactMessageCommand = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };

  isSubmitting = false;
  submitSuccess = false;
  submitError = '';

  ngOnInit(): void {
    this.contactService.getContactInfo().subscribe({
      next: (response) => {
        if (response.success) {
          this.contactInfo = response.data;
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load contact info', err);
        this.cdr.markForCheck();
      }
    });
  }

  onSubmit(): void {
    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = '';

    this.contactService.submitMessage(this.formModel).subscribe({
      next: (response) => {
        if (response.success) {
          this.submitSuccess = true;
          this.resetForm();
        } else {
          this.submitError = response.message || 'Submission failed. Please try again.';
        }
        this.isSubmitting = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        if (err.status === 429) {
          this.submitError = 'Rate limit exceeded. Please wait a moment before sending another message.';
        } else {
          this.submitError = 'An error occurred. Please check your inputs and try again.';
        }
        this.isSubmitting = false;
        this.cdr.markForCheck();
      }
    });
  }

  private resetForm(): void {
    this.formModel = {
      name: '',
      email: '',
      phone: '',
      message: ''
    };
  }
}
