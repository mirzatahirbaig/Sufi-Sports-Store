import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { ThemeService } from '../../services/theme.service';
import { ContactService } from '../../services/contact.service';
import { CategoryService } from '../../services/category.service';
import { ContactInfo, Category } from '../../models/models';
import { formatWhatsAppUrl } from '../../utils/contact.utils';

const DEFAULT_CATS: Category[] = [
  { id: 1, name: 'Boxing Gloves', isActive: true }, { id: 2, name: 'Hand Wraps', isActive: true },
  { id: 3, name: 'Headgear', isActive: true }, { id: 4, name: 'Punching Bags', isActive: true },
  { id: 5, name: 'Focus Mitts', isActive: true }, { id: 6, name: 'Protective Gear', isActive: true },
  { id: 7, name: 'Apparel', isActive: true }, { id: 8, name: 'Accessories', isActive: true }
];

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);
  private readonly contactService = inject(ContactService);
  private readonly categoryService = inject(CategoryService);
  private readonly cdr = inject(ChangeDetectorRef);
  private routerSub?: Subscription;

  contactInfo: ContactInfo | null = null;
  categories: Category[] = DEFAULT_CATS;
  isMobileMenuOpen = false;
  isMobileCategoryOpen = false;
  isScrolled = false;
  isBlackNavbar = false;

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = (window.pageYOffset || document.documentElement.scrollTop || 0) > 40;
    this.cdr.markForCheck();
  }

  ngOnInit(): void {
    this.loadContactInfo();
    this.loadCategories();
    this.checkRoute(this.router.url);
    this.routerSub = this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe(e => this.checkRoute(e.urlAfterRedirects || e.url));
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  getWhatsAppUrl(phone?: string | null): string {
    return formatWhatsAppUrl(phone);
  }

  toggleMobileMenu(): void { this.isMobileMenuOpen = !this.isMobileMenuOpen; }
  toggleMobileCategory(): void { this.isMobileCategoryOpen = !this.isMobileCategoryOpen; }
  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    this.isMobileCategoryOpen = false;
  }

  getTickerPoints(): string[] {
    if (this.contactInfo?.announcementItems?.length) return this.contactInfo.announcementItems;
    if (this.contactInfo?.announcementText) {
      return this.contactInfo.announcementText.split('•').map(s => s.trim()).filter(Boolean);
    }
    return [
      'CUSTOM BOXING GEAR MANUFACTURER & OEM SUPPLIER',
      'Custom Branding, Logos & Tailored Specs Available',
      'Factory Direct Export for Brands, Gyms & Distributors'
    ];
  }

  private checkRoute(url: string): void {
    const segs = this.router.parseUrl(url).root.children['primary']?.segments.map(s => s.path) || [];
    this.isBlackNavbar = segs.length >= 2 && (segs[0] === 'products' || segs[0] === 'blog') && !!segs[1];
    this.cdr.markForCheck();
  }

  private loadContactInfo(): void {
    this.contactService.getContactInfo().subscribe(res => {
      if (res.success && res.data) {
        this.contactInfo = res.data;
        if (res.data.themePrimaryColor) this.themeService.setPrimaryColor(res.data.themePrimaryColor);
        this.cdr.markForCheck();
      }
    });
  }

  private loadCategories(): void {
    this.categoryService.getCategories().subscribe(res => {
      if (res.success && res.data?.length) this.categories = res.data.filter(c => c.isActive);
      this.cdr.markForCheck();
    });
  }
}
