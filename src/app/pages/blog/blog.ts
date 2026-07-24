import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { BlogService } from '../../services/blog.service';
import { SeoService } from '../../services/seo.service';
import { Article } from '../../models/models';
import { ArticleCardComponent } from '../../components/article-card/article-card';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [ArticleCardComponent],
  templateUrl: './blog.html',
  styleUrl: './blog.scss'
})
export class BlogComponent implements OnInit {
  private readonly blogService = inject(BlogService);
  private readonly seoService = inject(SeoService);
  private readonly cdr = inject(ChangeDetectorRef);

  articles: Article[] = [];
  currentPage = 1;
  pageSize = 6;
  totalPages = 1;
  totalCount = 0;
  isLoading = true;

  ngOnInit(): void {
    this.seoService.updateSeo({
      title: 'Boxing Insights, Training Guides & Equipment News | Sufi Sports',
      description: 'Read the latest guides, equipment reviews, training tips, and boxing gear manufacturing standards from Sufi Sports experts.',
      keywords: 'boxing blog, boxing gloves guide, sparring tips, boxing equipment reviews, fight gear manufacturing'
    });
    this.loadArticles();
  }

  loadArticles(): void {
    this.isLoading = true;
    this.blogService.getArticles(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.articles = response.data.items;
          this.totalPages = response.data.totalPages;
          this.totalCount = response.data.totalCount;
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadArticles();
    }
  }
}
