import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContactService } from '../../services/contact.service';
import { ContactInfo } from '../../models/models';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class FooterComponent implements OnInit {
  private readonly contactService = inject(ContactService);
  private readonly cdr = inject(ChangeDetectorRef);

  contactInfo: ContactInfo | null = null;
  currentYear: number = new Date().getFullYear();

  ngOnInit(): void {
    this.contactService.getContactInfo().subscribe({
      next: (response) => {
        if (response.success) {
          this.contactInfo = response.data;
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        console.error('Failed to load contact info in footer', err);
        this.cdr.markForCheck();
      }
    });
  }
}
