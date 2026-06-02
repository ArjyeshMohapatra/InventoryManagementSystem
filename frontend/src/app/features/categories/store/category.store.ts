import { Injectable, inject, signal } from '@angular/core';
import { Category } from '../models/category.model';
import { CategoryRepository } from '../../../core/api/repositories/category.repository';
import { CacheStore } from 'src/app/shared/store/cache.store';
import { finalize, retry } from 'rxjs';
import { ProductStore } from '../../products/store/product.store';

@Injectable({
providedIn:'root'
})
export class CategoryStore extends CacheStore {

    private catRepo = inject(CategoryRepository);
    private prodStore = inject(ProductStore);

    categories = signal<Category[]>([]);
    selectedCategory = signal<Category | null>(null);

    loadCategories(force = false) {
        const hasCategories = this.categories().length > 0;

        if (!force && this.isCacheValid(hasCategories)) return;
        if (this.fetching()) return;

        if (this.categories().length) {
            this.refreshing.set(true);
        } else {
            this.loading.set(true);
        }

        this.error.set(null);
        this.fetching.set(true);
        this.catRepo.getCategories().pipe(
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
            next: (categories) => {
            this.categories.set(categories);
            this.lastLoaded.set(Date.now());
            },
            error: () => {
            this.error.set('Failed to load categories'); 
            }
        });
        }
        
    loadCategoryById(id:string) {
        this.loading.set(true);
        this.error.set(null);
        
        this.catRepo.getCategoryById(id).pipe(
            finalize(() => {
            this.loading.set(false);
            })
        ).subscribe({
            next: (category) => {
                this.selectedCategory.set(category);
            },
            error: () => {
                this.error.set('Failed to load category');
            }
            });
        }

    addCategory(category: Category, onSuccess?: () => void) { 
        this.loading.set(true);
        this.catRepo.addCategory(category).pipe(
            finalize(() => {
            this.loading.set(false);
            })
        ).subscribe({
            next: (created) => {
                this.categories.update(categories => [...categories, created]);
                onSuccess?.();
            },
            error: () => {
                this.error.set('Failed to add category');
            }
            });
        }

    updateCategory(category: Category,onSuccess?: () => void) {
        this.loading.set(true);
        this.catRepo.updateCategory(category).pipe(
            finalize(() => {
            this.loading.set(false);
            })
        ).subscribe({
            next: (updated) => {
                this.categories.update(categories => categories.map(existing => existing.id === updated.id ? updated : existing));
                onSuccess?.();
            },
            error: () => {
                this.error.set('Failed to update category');
            }
            });
        }

    deleteCategory(id: string, onSuccess?: () => void) {
        this.loading.set(true);
        this.catRepo.deleteCategory(id).pipe(
            finalize(() => {
            this.loading.set(false);
            })
        ).subscribe({
            next: () => {
                this.categories.update(categories => categories.filter(category => category.id !== id));
                onSuccess?.();
            },
            error: () => {
                this.error.set('Failed to delete category');
            }
            });
        }

    deleteCategoryWithProducts(categoryId: string, onSuccess?: () => void) {
        this.loading.set(true);
        this.catRepo.deleteCategoryWithProducts(categoryId).pipe(
            finalize(() => {
            this.loading.set(false);
            })
        ).subscribe({
            next: () => {
                this.categories.update(categories => categories.filter(category => category.id !== categoryId));
                this.prodStore.products.update(products => products.filter(product => product.category !== categoryId));
                onSuccess?.();
            },
            error: () => {
                this.error.set('Failed to delete category');
            }
            });
        }
}