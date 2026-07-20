import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/models';
import { resolveImageUrl } from '../../utils/image.utils';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss'
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cdr = inject(ChangeDetectorRef);

  product: Product | null = null;
  safeDescription: SafeHtml | null = null;
  selectedImage = '';
  isLoading = true;
  errorMsg = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadProduct(id);
    } else {
      this.errorMsg = 'Invalid Product ID';
      this.isLoading = false;
    }
  }

  private loadProduct(id: number): void {
    this.productService.getProductById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.product = response.data;
          this.safeDescription = this.product.description 
            ? this.sanitizer.bypassSecurityTrustHtml(this.product.description) 
            : '';
          this.initializeGallery();
        } else {
          this.errorMsg = response.message || 'Product not found';
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMsg = 'Failed to retrieve product details.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  selectedImageIndex = 0;

  private initializeGallery(): void {
    if (this.product && this.product.imageUrls?.length > 0) {
      this.selectedImageIndex = 0;
      this.selectedImage = this.resolveImageUrl(this.product.imageUrls[0]);
    } else {
      this.selectedImageIndex = 0;
      this.selectedImage = 'images/product_fallback.jpg';
    }
  }

  resolveImageUrl(url: string | undefined): string {
    return resolveImageUrl(url, 'images/product_fallback.jpg');
  }

  selectImageIndex(index: number): void {
    if (this.product && this.product.imageUrls && index >= 0 && index < this.product.imageUrls.length) {
      this.selectedImageIndex = index;
      this.selectedImage = this.resolveImageUrl(this.product.imageUrls[index]);
    }
  }

  nextImage(): void {
    if (this.product && this.product.imageUrls && this.product.imageUrls.length > 1) {
      const nextIdx = (this.selectedImageIndex + 1) % this.product.imageUrls.length;
      this.selectImageIndex(nextIdx);
    }
  }

  prevImage(): void {
    if (this.product && this.product.imageUrls && this.product.imageUrls.length > 1) {
      const prevIdx = (this.selectedImageIndex - 1 + this.product.imageUrls.length) % this.product.imageUrls.length;
      this.selectImageIndex(prevIdx);
    }
  }

  getSpecs(): { name: string; value: string }[] {
    if (!this.product) return [];

    if (this.product.specifications && Object.keys(this.product.specifications).length > 0) {
      return Object.entries(this.product.specifications).map(([name, value]) => ({ name, value }));
    }

    return [
      { name: 'Material', value: 'Premium Grade Materials' },
      { name: 'Durability', value: 'Reinforced seams and stitching' },
      { name: 'Origin', value: 'Sialkot, Pakistan' },
      { name: 'Warranty', value: '1 Year factory guarantee' }
    ];
  }
}
