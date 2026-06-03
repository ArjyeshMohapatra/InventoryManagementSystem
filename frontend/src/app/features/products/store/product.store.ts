import { Injectable, inject, signal } from '@angular/core';
import { Product } from '../models/product.model';
import { ProductRepository } from 'src/app/core/api/repositories/product.repository';
import { CacheStore } from 'src/app/shared/store/cache.store';
import { retry, finalize, forkJoin } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProductStore extends CacheStore {
    private prodRepo = inject(ProductRepository);
    products = signal<Product[]>([]);
    selectedProduct = signal<Product | null>(null);

    // user has force refreshed or not
    loadProducts(force = false) {
        const hasProducts = this.products().length > 0;

        if (!force && this.isCacheValid(hasProducts)) return;
        if (this.fetching()) return;

        if (this.products().length) {
            this.refreshing.set(true);
        } else {
            this.loading.set(true);
        }
        this.error.set(null);

        this.fetching.set(true);
        this.prodRepo.getProducts().pipe(
            retry({
                count: this.retryCount,
                delay: this.retryDelay
            }),
            finalize(() => {
                this.loading.set(false);
                this.refreshing.set(false);
                this.fetching.set(false);
            })
        ).subscribe({
            next: (products) => {
                this.products.set(products.sort((a,b) => a.order - b.order));
                this.lastLoaded.set(Date.now());
            },
            error: () => {
                this.error.set('Failed to load products');
            },

        });
    }

    loadProductById(id: string) {
        this.loading.set(true);
        this.error.set(null);
        this.prodRepo.getProductById(id).pipe(
            finalize(() => {
              this.loading.set(false);
            })
          ).subscribe({
            next: (product) => {
                this.selectedProduct.set(product);
            },
            error: () => {
                this.error.set('Failed to load product');
            }
        });
    }

    getProductsByCategory(categoryId: string) {
        return this.products().filter(product => product.category === categoryId);
    }

    addProduct(product: Product, onSuccess?: () => void) {
        this.loading.set(true);
        const products = this.products();
        const latestOrder = products.length ? products[products.length - 1].order + 1 : 1;
      
        this.prodRepo.addProduct({ ...product, order: latestOrder }).pipe(
            finalize(() => {
              this.loading.set(false);
            })
          ).subscribe({
            next: (created) => {
                this.products.update(products => [...products, created]);
                onSuccess?.();
            },
            error: () => {
              this.error.set('Failed to add product');
            }
          });
      }

    updateProduct(product: Product, onSuccess?: () => void) {
        this.loading.set(true);
        this.prodRepo.updateProduct(product).pipe(
            finalize(() => {
              this.loading.set(false);
            })
          ).subscribe({
            next: (updated) => {
                  this.products.update(
                      products => products.map(existing =>
                          existing.id === updated.id ? updated : existing
                      ).sort((a,b) => a.order - b.order)
                  );
                onSuccess?.();
            },
            error: () => {
                this.error.set('Failed to update product');
            }
        });
    }

    deleteProduct(id: string, onSuccess?: () => void) {
        this.loading.set(true);
        this.prodRepo.deleteProduct(id).pipe(
            finalize(() => {
              this.loading.set(false);
            })
          ).subscribe({
            next: () => {
                  this.products.update(products => products.filter(product => product.id !== id));
                  this.loadProducts();
                onSuccess?.();
            },
            error: () => {
                this.error.set('Failed to delete product');
            }
        });
    }

    
}