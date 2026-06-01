import { Injectable, inject, signal } from '@angular/core';
import { Category } from '../models/category.model';
import { CategoryRepository } from '../../../core/api/repositories/category.repository';

@Injectable({
providedIn:'root'
})
export class CategoryStore {

private catRepo = inject(CategoryRepository);

categories = signal<Category[]>([]);
selectedCategory = signal<Category | null>(null);
loading = signal(false);
error = signal<string | null>(null);

loadCategories() {
    this.loading.set(true);
    this.error.set(null);
  
    this.catRepo.getCategories().subscribe({
        next: (categories) => {
          this.categories.set(categories);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Failed to load categories');
          this.loading.set(false);
        }
      });
    }
    
loadCategoryById(id:string) {
    this.loading.set(true);
    this.error.set(null);
    
    this.catRepo.getCategoryById(id).subscribe({
        next: (category) => {
            this.selectedCategory.set(category);
            this.loading.set(false);
        },
        error: () => {
            this.error.set('Failed to load category');
            this.loading.set(false);
        }
        });
    }

addCategory(category: Category, onSuccess?: () => void) { 
    this.loading.set(true);
    this.catRepo.addCategory(category).subscribe({
        next: (created) => {
            this.categories.update(categories => [...categories, created]);
            this.loading.set(false);
            onSuccess?.();
        },
        error: () => {
            this.error.set('Failed to add category');
            this.loading.set(false);
        }
        });
    }

updateCategory(category: Category,onSuccess?: () => void) {
    this.loading.set(true);
    this.catRepo.updateCategory(category).subscribe({
        next: (updated) => {
            this.categories.update(categories => categories.map(existing => existing.id === updated.id ? updated : existing));
            this.loading.set(false);
            onSuccess?.();
        },
        error: () => {
            this.error.set('Failed to update category');
            this.loading.set(false);
        }
        });
    }

deleteCategory(id: string, onSuccess?: () => void) {
    this.loading.set(true);
    this.catRepo.deleteCategory(id).subscribe({
        next: () => {
            this.categories.update(categories => categories.filter(category => category.id !== id));
            this.loading.set(false);
            onSuccess?.();
        },
        error: () => {
            this.error.set('Failed to delete category');
            this.loading.set(false);
        }
        });
    }

deleteCategoryWithProducts(id: string, onSuccess?: () => void) {
    this.loading.set(true);
    this.catRepo.deleteCategoryWithProducts(id).subscribe({
        next: () => {
            this.categories.update(categories => categories.filter(category => category.id !== id));
            this.loading.set(false);
            onSuccess?.();
        },
        error: () => {
            this.error.set('Failed to delete category');
            this.loading.set(false);
        }
        });
    }
}