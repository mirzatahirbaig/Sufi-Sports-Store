import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { BlogService } from '../../services/blog.service';
import { CategoryService } from '../../services/category.service';
import { Product, Article, Category } from '../../models/models';
import { resolveImageUrl } from '../../utils/image.utils';
import { BannerCarouselComponent } from '../../components/banner-carousel/banner-carousel';
import { ProductCardComponent } from '../../components/product-card/product-card';
import { ArticleCardComponent } from '../../components/article-card/article-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, BannerCarouselComponent, ProductCardComponent, ArticleCardComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly productService = inject(ProductService);
  private readonly blogService = inject(BlogService);
  private readonly categoryService = inject(CategoryService);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('tickerTrack') tickerTrack?: ElementRef<HTMLDivElement>;

  featuredProducts: Product[] = [];
  recentArticles: Article[] = [];
  categories: Category[] = [];
  isHovered = false;
  isLoadingProducts = true;
  isLoadingArticles = true;
  isLoadingCategories = true;
  private animId?: number;
  private processTimer?: any;

  processImages = ['/images/one.webp', '/images/two.webp', '/images/three.webp', '/images/four.webp'];
  currentProcessIndex = 0;

  get tickerCategories(): Category[] {
    return this.categories.length > 3 ? [...this.categories, ...this.categories, ...this.categories] : this.categories;
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadFeaturedProducts();
    this.loadRecentArticles();
    this.startAutoScroll();
    this.processTimer = setInterval(() => this.nextProcessSlide(), 2000);
  }

  ngOnDestroy(): void {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.processTimer) clearInterval(this.processTimer);
  }

  nextProcessSlide(): void {
    this.currentProcessIndex = (this.currentProcessIndex + 1) % this.processImages.length;
    this.cdr.markForCheck();
  }

  prevProcessSlide(): void {
    this.currentProcessIndex = (this.currentProcessIndex - 1 + this.processImages.length) % this.processImages.length;
    this.cdr.markForCheck();
  }

  setProcessSlide(idx: number): void {
    this.currentProcessIndex = idx;
    this.cdr.markForCheck();
  }

  private startAutoScroll(): void {
    const step = () => {
      if (!this.isHovered && this.tickerTrack?.nativeElement) {
        const el = this.tickerTrack.nativeElement;
        el.scrollLeft += 1;
        if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0;
      }
      this.animId = requestAnimationFrame(step);
    };
    this.animId = requestAnimationFrame(step);
  }

  scrollCategories(direction: 'left' | 'right'): void {
    if (this.tickerTrack?.nativeElement) {
      const amount = direction === 'left' ? -360 : 360;
      this.tickerTrack.nativeElement.scrollBy({ left: amount, behavior: 'smooth' });
    }
  }

  getCategoryBgImage(cat: Category): string {
    if (cat.imageUrl) return resolveImageUrl(cat.imageUrl, '');
    const name = (cat.name || '').toLowerCase();
    if (name.includes('head') || name.includes('mitt')) return resolveImageUrl('/uploads/category_headgear.png', '');
    if (name.includes('bag') || name.includes('protect')) return resolveImageUrl('/uploads/category_punching_bags.png', '');
    return resolveImageUrl('/uploads/category_boxing_gloves.png', '');
  }

  private loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (res) => { if (res.success && res.data) this.categories = res.data; this.isLoadingCategories = false; this.cdr.markForCheck(); },
      error: () => { this.isLoadingCategories = false; this.cdr.markForCheck(); }
    });
  }

  private loadFeaturedProducts(): void {
    this.productService.getProducts({ isFeatured: true, pageSize: 6, isActive: true }).subscribe({
      next: (res) => { if (res.success && res.data?.items) this.featuredProducts = res.data.items; this.isLoadingProducts = false; this.cdr.markForCheck(); },
      error: () => { this.isLoadingProducts = false; this.cdr.markForCheck(); }
    });
  }

  private loadRecentArticles(): void {
    this.blogService.getArticles(1, 3).subscribe({
      next: (res) => { if (res.success && res.data?.items) this.recentArticles = res.data.items; this.isLoadingArticles = false; this.cdr.markForCheck(); },
      error: () => { this.isLoadingArticles = false; this.cdr.markForCheck(); }
    });
  }
}
