import { Injectable, inject, signal } from '@angular/core';
import { Product } from '../models/product.model';
import { ProductRepository } from 'src/app/core/api/repositories/product.repository';

@Injectable({
    providedIn: 'root'
})
export class ProductStore {
    private prodRepo = inject(ProductRepository);
    products = signal<Product[]>([]);
    selectedProduct = signal<Product | null>(null);
    loading = signal(false);
    error = signal<string | null>(null);
    lastLoaded = signal(0);
    ttl = 1000 * 60 * 2;

    // user has force refreshed or not
    loadProducts(force = false) {
        const hasProducts = this.products().length > 0;
        const cacheAge = Date.now() - this.lastLoaded();
        const cacheValid = cacheAge < this.ttl;

        if (!force && hasProducts && cacheValid) return;

        this.loading.set(true);
        this.error.set(null);

        this.prodRepo.getProducts().subscribe({
            next: (products) => {
                this.products.set(products);
                this.lastLoaded.set(Date.now());
                this.loading.set(false);

            },
            error: () => {
                this.error.set('Failed to load products');
                this.loading.set(false);
            }
        });
    }

    loadProductById(id: string) {
        this.loading.set(true);
        this.error.set(null);
        this.prodRepo.getProductById(id).subscribe({
            next: (product) => {
                this.selectedProduct.set(product);
                this.loading.set(false);
            },
            error: () => {
                this.error.set('Failed to load product');
                this.loading.set(false);
            }
        });
    }

    getProductsByCategory(categoryId: string) {
        return this.products().filter(product => product.category === categoryId);
    }

    addProduct(product: Product, onSuccess?: () => void) {
        this.loading.set(true);
        this.prodRepo.addProduct(product).subscribe({
            next: (created) => {
                this.products.update(products => [...products, created]);
                this.loading.set(false);
                onSuccess?.();
            },
            error: () => {
                this.error.set('Failed to add product');
                this.loading.set(false);
            }
        });
    }

    updateProduct(product: Product, onSuccess?: () => void) {
        this.loading.set(true);
        this.prodRepo.updateProduct(product).subscribe({
            next: (updated) => {
                this.products.update(products => products.map(existing => existing.id === updated.id ? updated : existing));
                this.loading.set(false);
                onSuccess?.();
            },
            error: () => {
                this.error.set('Failed to update product');
                this.loading.set(false);
            }
        });
    }

    deleteProduct(id: string, onSuccess?: () => void) {
        this.loading.set(true);
        this.prodRepo.deleteProduct(id).subscribe({
            next: () => {
                this.products.update(products => products.filter(product => product.id !== id));
                this.loading.set(false);
                onSuccess?.();
            },
            error: () => {
                this.error.set('Failed to delete product');
                this.loading.set(false);
            }
        });
    }
}