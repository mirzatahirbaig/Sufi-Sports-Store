import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
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
  imports: [
    RouterLink,
    BannerCarouselComponent,
    ProductCardComponent,
    ArticleCardComponent
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly blogService = inject(BlogService);
  private readonly categoryService = inject(CategoryService);
  private readonly cdr = inject(ChangeDetectorRef);

  featuredProducts: Product[] = [];
  recentArticles: Article[] = [];
  categories: Category[] = [];

  get tickerCategories(): Category[] {
    if (this.categories.length > 3) {
      return [...this.categories, ...this.categories, ...this.categories];
    }
    return this.categories;
  }

  isLoadingProducts = true;
  isLoadingArticles = true;
  isLoadingCategories = true;

  ngOnInit(): void {
    this.loadCategories();
    this.loadFeaturedProducts();
    this.loadRecentArticles();
  }

  resolveCategoryImageUrl(url: string | undefined): string {
    return resolveImageUrl(url, '');
  }

  getCategoryBgImage(cat: Category): string {
    if (cat.imageUrl) {
      return this.resolveCategoryImageUrl(cat.imageUrl);
    }
    const name = (cat.name || '').toLowerCase();
    if (name.includes('head') || name.includes('mitt')) {
      return this.resolveCategoryImageUrl('/uploads/category_headgear.png');
    }
    if (name.includes('bag') || name.includes('protect')) {
      return this.resolveCategoryImageUrl('/uploads/category_punching_bags.png');
    }
    return this.resolveCategoryImageUrl('/uploads/category_boxing_gloves.png');
  }

  private loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.categories = response.data;
        }
        this.isLoadingCategories = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoadingCategories = false;
        this.cdr.markForCheck();
      }
    });
  }

  private loadFeaturedProducts(): void {
    this.productService.getProducts({ isFeatured: true, pageSize: 6, isActive: true }).subscribe({
      next: (response) => {
        if (response.success && response.data?.items) {
          this.featuredProducts = response.data.items;
        }
        this.isLoadingProducts = false;
        this.cdr.markForCheck();
      },
      error: () => { 
        this.isLoadingProducts = false;
        this.cdr.markForCheck();
      }
    });
  }

  private loadRecentArticles(): void {
    this.blogService.getArticles(1, 3).subscribe({
      next: (response) => {
        if (response.success && response.data?.items) {
          this.recentArticles = response.data.items;
        }
        this.isLoadingArticles = false;
        this.cdr.markForCheck();
      },
      error: () => { 
        this.isLoadingArticles = false;
        this.cdr.markForCheck();
      }
    });
  }
}
