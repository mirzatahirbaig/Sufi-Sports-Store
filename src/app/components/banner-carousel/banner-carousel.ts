import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BannerService } from '../../services/banner.service';
import { Banner } from '../../models/models';

@Component({
  selector: 'app-banner-carousel',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './banner-carousel.html',
  styleUrl: './banner-carousel.scss'
})
export class BannerCarouselComponent implements OnInit, OnDestroy {
  private readonly bannerService = inject(BannerService);

  banners: Banner[] = [];
  currentIndex = 0;
  autoPlayInterval: any;
  isHovering = false;

  ngOnInit(): void {
    this.bannerService.getBanners().subscribe({
      next: (res) => this.handleBannerResponse(res),
      error: () => this.useFallback()
    });
  }

  private handleBannerResponse(response: any): void {
    if (response.success && response.data?.length > 0) {
      this.banners = response.data.sort((a: Banner, b: Banner) => a.displayOrder - b.displayOrder);
      if (this.banners.length > 1) {
        this.startAutoPlay();
      }
    } else {
      this.useFallback();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  private useFallback(): void {
    this.banners = [{
      id: 0, imageUrl: 'images/banner1.jpg', targetUrl: '/products',
      callToAction: 'Explore Boxing Gear', displayOrder: 1,
      startDate: '', endDate: '', isEnabled: true
    }];
  }

  resolveImageUrl(url: string): string {
    if (!url) return 'images/banner1.jpg';
    return url;
  }

  startAutoPlay(): void {
    this.stopAutoPlay();
    if (!this.isHovering && this.banners.length > 1) {
      this.autoPlayInterval = setInterval(() => {
        this.nextSlide();
      }, 200);
    }
  }

  stopAutoPlay(): void {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  onMouseEnter(): void {
    this.isHovering = true;
    this.stopAutoPlay();
  }

  onMouseLeave(): void {
    this.isHovering = false;
    this.startAutoPlay();
  }

  resetAutoPlay(): void {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  nextSlide(isManual = false): void {
    if (this.banners.length > 0) {
      this.currentIndex = (this.currentIndex + 1) % this.banners.length;
      if (isManual) this.resetAutoPlay();
    }
  }

  prevSlide(isManual = false): void {
    if (this.banners.length > 0) {
      this.currentIndex = (this.currentIndex - 1 + this.banners.length) % this.banners.length;
      if (isManual) this.resetAutoPlay();
    }
  }

  setSlide(index: number): void {
    this.currentIndex = index;
    this.resetAutoPlay();
  }
}
