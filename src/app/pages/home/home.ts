import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { BlogService } from '../../services/blog.service';
import { Product, Article } from '../../models/models';
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
  private readonly cdr = inject(ChangeDetectorRef);

  featuredProducts: Product[] = [];
  recentArticles: Article[] = [];
  isLoadingProducts = true;
  isLoadingArticles = true;

  ngOnInit(): void {
    this.loadFeaturedProducts();
    this.loadRecentArticles();
  }

  private loadFeaturedProducts(): void {
    this.productService.getProducts({ isFeatured: true, pageSize: 4, isActive: true }).subscribe({
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
