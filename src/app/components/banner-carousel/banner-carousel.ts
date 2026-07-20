import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BannerService } from '../../services/banner.service';
import { Banner } from '../../models/models';
import { resolveImageUrl } from '../../utils/image.utils';

@Component({
  selector: 'app-banner-carousel',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './banner-carousel.html',
  styleUrl: './banner-carousel.scss'
})
export class BannerCarouselComponent implements OnInit, OnDestroy {
  private readonly bannerService = inject(BannerService);
  private readonly cdr = inject(ChangeDetectorRef);

  banners: Banner[] = [];
  currentIndex = 0;
  autoPlayInterval: any;
  isHovering = false;

  ngOnInit(): void {
    this.bannerService.getBanners().subscribe({
      next: (res) => this.handleResponse(res),
      error: () => this.useFallback()
    });
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  private handleResponse(res: any): void {
    if (res.success && res.data?.length > 0) {
      this.banners = res.data.sort((a: Banner, b: Banner) => a.displayOrder - b.displayOrder);
      if (this.banners.length === 1) {
        // Append additional slides to guarantee infinite auto-slide experience
        this.banners.push(
          { id: 901, imageUrl: 'images/banner2.jpg', targetUrl: '/products?category=Boxing%20Gloves', callToAction: 'Explore Boxing Gear', displayOrder: 2, startDate: '', endDate: '', isEnabled: true },
          { id: 902, imageUrl: 'images/banner3.jpg', targetUrl: '/contact', callToAction: 'Request Factory Quote', displayOrder: 3, startDate: '', endDate: '', isEnabled: true }
        );
      }
    } else {
      this.useFallback();
    }
    this.startAutoPlay();
    this.cdr.markForCheck();
  }

  private useFallback(): void {
    this.banners = [
      { id: 900, imageUrl: 'images/banner1.jpg', targetUrl: '/products', callToAction: 'Shop Pro Collection', displayOrder: 1, startDate: '', endDate: '', isEnabled: true },
      { id: 901, imageUrl: 'images/banner2.jpg', targetUrl: '/products?category=Boxing%20Gloves', callToAction: 'Explore Boxing Gear', displayOrder: 2, startDate: '', endDate: '', isEnabled: true },
      { id: 902, imageUrl: 'images/banner3.jpg', targetUrl: '/contact', callToAction: 'Request Factory Quote', displayOrder: 3, startDate: '', endDate: '', isEnabled: true }
    ];
  }

  resolveImageUrl(url: string | undefined): string {
    return resolveImageUrl(url, 'images/banner1.jpg');
  }

  startAutoPlay(): void {
    this.stopAutoPlay();
    if (this.banners.length > 1) {
      this.autoPlayInterval = setInterval(() => {
        this.nextSlide();
      }, 2000);
    }
  }

  stopAutoPlay(): void {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  nextSlide(isManual = false): void {
    if (!this.banners.length) return;
    this.currentIndex = (this.currentIndex + 1) % this.banners.length;
    this.cdr.markForCheck();
    if (isManual) this.startAutoPlay();
  }

  prevSlide(isManual = false): void {
    if (!this.banners.length) return;
    this.currentIndex = (this.currentIndex - 1 + this.banners.length) % this.banners.length;
    this.cdr.markForCheck();
    if (isManual) this.startAutoPlay();
  }

  setSlide(index: number): void {
    this.currentIndex = index;
    this.cdr.markForCheck();
    this.startAutoPlay();
  }
}
