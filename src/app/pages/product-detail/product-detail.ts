import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ProductService } from '../../services/product.service';
import { SeoService } from '../../services/seo.service';
import { Product } from '../../models/models';
import { resolveImageUrl } from '../../utils/image.utils';

const DEFAULT_SPECS = [
  { name: 'Material', value: 'Premium Grade Leather / Synthetics' },
  { name: 'Durability', value: 'Reinforced seams and triple-stitching' },
  { name: 'Origin', value: 'Sialkot, Pakistan' },
  { name: 'Warranty', value: '1 Year factory guarantee' }
];

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
  private readonly seoService = inject(SeoService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cdr = inject(ChangeDetectorRef);

  product: Product | null = null;
  safeDescription: SafeHtml | null = null;
  selectedImage = '';
  selectedImageIndex = 0;
  isLoading = true;
  errorMsg = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.loadProduct(id);
    else { this.errorMsg = 'Invalid Product ID'; this.isLoading = false; }
  }

  private loadProduct(id: number): void {
    this.productService.getProductById(id).subscribe({
      next: (res) => this.handleSuccess(res),
      error: () => { this.errorMsg = 'Failed to retrieve product details.'; this.isLoading = false; this.cdr.markForCheck(); }
    });
  }

  private handleSuccess(res: { success: boolean; data?: Product; message?: string }): void {
    if (res.success && res.data) {
      this.product = res.data;
      const desc = this.product.description;
      this.safeDescription = desc ? this.sanitizer.bypassSecurityTrustHtml(desc) : '';
      this.initializeGallery();
      this.applyProductSeo(this.product);
    } else this.errorMsg = res.message || 'Product not found';
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  private applyProductSeo(product: Product): void {
    const cleanDesc = (product.description || '').replace(/<[^>]*>?/gm, '').slice(0, 160) || `Buy ${product.name} - Pro Boxing Gear by Sufi Sports.`;
    const image = this.resolveImageUrl(product.imageUrls?.[0]);
    const inStock = product.stockQuantity > 0 || product.isActive;
    
    this.seoService.updateSeo({
      title: `${product.name} - Pro Boxing ${product.category || 'Equipment'}`,
      description: cleanDesc,
      keywords: `${product.name}, ${product.category}, pro boxing gear, boxing gloves USA, Sufi Sports`,
      ogImage: image,
      type: 'product'
    });

    this.seoService.setJsonLdSchema({
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': product.name,
      'image': [image],
      'description': cleanDesc,
      'sku': `SUFI-${product.id}`,
      'category': product.category || 'Boxing Gear',
      'offers': {
        '@type': 'Offer',
        'priceCurrency': 'USD',
        'price': product.price,
        'availability': inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        'itemCondition': 'https://schema.org/NewCondition'
      }
    });
  }

  private initializeGallery(): void {
    const images = this.product?.imageUrls;
    this.selectedImageIndex = 0;
    this.selectedImage = images?.length ? this.resolveImageUrl(images[0]) : 'images/product_fallback.jpg';
  }

  resolveImageUrl(url: string | undefined): string { return resolveImageUrl(url, 'images/product_fallback.jpg'); }

  selectImageIndex(index: number): void {
    const images = this.product?.imageUrls;
    if (images && index >= 0 && index < images.length) {
      this.selectedImageIndex = index;
      this.selectedImage = this.resolveImageUrl(images[index]);
    }
  }

  nextImage(): void {
    const total = this.product?.imageUrls?.length || 0;
    if (total > 1) this.selectImageIndex((this.selectedImageIndex + 1) % total);
  }

  prevImage(): void {
    const total = this.product?.imageUrls?.length || 0;
    if (total > 1) this.selectImageIndex((this.selectedImageIndex - 1 + total) % total);
  }

  getSpecs(): { name: string; value: string }[] {
    const s = this.product?.specifications;
    return s && Object.keys(s).length ? Object.entries(s).map(([name, value]) => ({ name, value })) : DEFAULT_SPECS;
  }
}
