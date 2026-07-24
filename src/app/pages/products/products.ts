import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { SeoService } from '../../services/seo.service';
import { Product } from '../../models/models';
import { ProductCardComponent } from '../../components/product-card/product-card';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [FormsModule, ProductCardComponent],
  templateUrl: './products.html',
  styleUrl: './products.scss'
})
export class ProductsComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly seoService = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  products: Product[] = [];
  categories: string[] = ['All'];
  selectedCategory = 'All';
  searchTerm = '';
  sortBy = 'name-asc';

  currentPage = 1;
  pageSize = 8;
  totalPages = 1;
  totalCount = 0;
  isLoading = true;

  ngOnInit(): void {
    this.updateCategorySeo('All');
    this.loadCategories();
    this.route.queryParams.subscribe(params => {
      if (params['category']) this.selectedCategory = params['category'];
      this.loadProducts();
    });
  }

  private updateCategorySeo(category: string): void {
    const catName = category === 'All' ? 'Boxing Gear & Equipment' : category;
    this.seoService.updateSeo({
      title: `Shop Pro ${catName} | Sufi Sports USA`,
      description: `Explore our premium collection of pro-grade ${catName.toLowerCase()} manufactured for durability, comfort, and max athletic performance. Bulk & wholesale available in the USA.`,
      keywords: `${catName}, pro boxing gear, boxing gloves, heavy bags, headgear, focus mitts, boxing equipment USA`
    });
  }

  scrollPills(element: HTMLDivElement, direction: 'left' | 'right'): void {
    element.scrollBy({ left: direction === 'left' ? -220 : 220, behavior: 'smooth' });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        if (res.success && res.data?.length) this.categories = ['All', ...res.data.map(c => c.name)];
        this.cdr.markForCheck();
      },
      error: () => this.cdr.markForCheck()
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getProducts({
      pageNumber: this.currentPage, pageSize: this.pageSize,
      searchTerm: this.searchTerm || undefined,
      category: this.selectedCategory !== 'All' ? this.selectedCategory : undefined, isActive: true
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.products = res.data.items;
          this.totalPages = res.data.totalPages;
          this.totalCount = res.data.totalCount;
          this.filterAndSort();
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.isLoading = false; this.cdr.markForCheck(); }
    });
  }

  setCategory(category: string): void {
    this.selectedCategory = category;
    this.currentPage = 1;
    this.updateCategorySeo(category);
    this.loadProducts();
  }

  onSearch(): void { this.currentPage = 1; this.loadProducts(); }
  onSortChange(): void { this.filterAndSort(); }
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) { this.currentPage = page; this.loadProducts(); }
  }

  private filterAndSort(): void {
    if (this.selectedCategory !== 'All') {
      this.products = this.products.filter(p => p.category?.toLowerCase() === this.selectedCategory.toLowerCase());
    }
    if (this.sortBy === 'price-asc') this.products.sort((a, b) => a.price - b.price);
    else if (this.sortBy === 'price-desc') this.products.sort((a, b) => b.price - a.price);
    else this.products.sort((a, b) => a.name.localeCompare(b.name));
  }
}
