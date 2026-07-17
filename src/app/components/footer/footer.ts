import { Component, inject, OnInit } from '@angular/core';
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

  contactInfo: ContactInfo | null = null;
  currentYear: number = new Date().getFullYear();

  ngOnInit(): void {
    this.contactService.getContactInfo().subscribe({
      next: (response) => {
        if (response.success) {
          this.contactInfo = response.data;
        }
      },
      error: (err) => console.error('Failed to load contact info in footer', err)
    });
  }
}
