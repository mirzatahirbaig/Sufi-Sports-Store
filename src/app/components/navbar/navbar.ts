import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { ContactService } from '../../services/contact.service';
import { ContactInfo } from '../../models/models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent implements OnInit {
  private readonly themeService = inject(ThemeService);
  private readonly contactService = inject(ContactService);
  private readonly cdr = inject(ChangeDetectorRef);
  
  contactInfo: ContactInfo | null = null;
  isMobileMenuOpen = false;

  ngOnInit(): void {
    this.contactService.getContactInfo().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.contactInfo = res.data;
          if (res.data.themePrimaryColor) {
            this.themeService.setPrimaryColor(res.data.themePrimaryColor);
          }
          this.cdr.markForCheck();
        }
      },
      error: () => this.cdr.markForCheck()
    });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  getTickerPoints(): string[] {
    if (this.contactInfo?.announcementItems && this.contactInfo.announcementItems.length > 0) {
      return this.contactInfo.announcementItems;
    }
    if (this.contactInfo?.announcementText) {
      return this.contactInfo.announcementText.split('•').map(s => s.trim()).filter(s => s.length > 0);
    }
    return [
      'FREE SHIPPING ON BULK ORDERS',
      'Pro-Grade Boxing Gear Direct from Manufacturer'
    ];
  }
}
