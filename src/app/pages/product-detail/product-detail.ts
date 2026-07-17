import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/models';

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
  private readonly cdr = inject(ChangeDetectorRef);

  product: Product | null = null;
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

  private initializeGallery(): void {
    if (this.product && this.product.imageUrls?.length > 0) {
      this.selectedImage = this.resolveImageUrl(this.product.imageUrls[0]);
    } else {
      this.selectedImage = 'images/product_fallback.jpg';
    }
  }

  resolveImageUrl(url: string): string {
    if (!url) return 'images/product_fallback.jpg';
    return url;
  }

  selectImage(url: string): void {
    this.selectedImage = this.resolveImageUrl(url);
  }

  getSpecs(): { name: string; value: string }[] {
    if (!this.product) return [];
    if (this.product.category === 'Football') {
      return [
        { name: 'Material', value: 'High-grade TPU with foam backing' },
        { name: 'Size', value: 'Official Size 5' },
        { name: 'Construction', value: 'Machine Stitched 32 panels' },
        { name: 'Bladder', value: 'Reinforced rubber bladder for air retention' }
      ];
    } else if (this.product.category === 'Cricket') {
      return [
        { name: 'Willow Type', value: 'English Willow' },
        { name: 'Handle Type', value: 'Treble-spring cane handle' },
        { name: 'Size', value: 'Short Handle (Full Size)' },
        { name: 'Grip', value: 'Chevron scale dynamic grip' }
      ];
    }
    return [
      { name: 'Material', value: 'Premium Grade Materials' },
      { name: 'Durability', value: 'Reinforced seams and stitching' },
      { name: 'Origin', value: 'Sialkot, Pakistan' },
      { name: 'Warranty', value: '1 Year limited warranty' }
    ];
  }
}
