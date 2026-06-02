import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SearchInput } from '../../../../shared/ui/search-input/search-input';
import { Table } from '../../../../shared/ui/table/table';
import { CategoryStore } from '../../store/category.store';
import { Modal } from '../../../../shared/ui/modal/modal';
import { ProductRepository } from '../../../../core/api/repositories/product.repository';
import { lastValueFrom } from 'rxjs';
import { Category } from '../../models/category.model';
import { ProductStore } from 'src/app/features/products/store/product.store';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [RouterLink, SearchInput, Table, Modal],
  templateUrl: './category-list.html',
})
export class CategoryList {
  private categoryStore = inject(CategoryStore);
  private productStore = inject(ProductStore);
  private productRepo = inject(ProductRepository);

  catStore = this.categoryStore;
  prodStore = this.productStore;

  searchInput = signal('');
  searchTerm = signal('');
  columns = ['name'];
  actions = true;
  selectedCategory = signal<Category | any>(null);
  showDeleteModal = signal(false);
  deleteMessage = signal('');

  constructor() {
    effect((onCleanup) => {
      const value = this.searchInput();
      const timer = setTimeout(() => this.searchTerm.set(value), 300);
      onCleanup(() => clearTimeout(timer));
    });
    this.catStore.loadCategories();
    this.prodStore.loadProducts();
  }

  filteredCategories = computed(() => {
    const categories = this.catStore.categories();
    const term = this.searchTerm().toLowerCase().trim();
    return categories.filter((category) => !term || category.name.toLowerCase().includes(term));
  });

  async openDeleteModal(category: any) {
    this.selectedCategory.set(category);
    const products = this.getCategoryProducts(category.id);
    const count = products.length;
    this.deleteMessage.set(
      count > 0 ? 
        `${category.name} Contains ${count} Linked Products. Deleting This Category Will Also Remove Those Products.`
        : `This action can't be undone, still want to delete Category ${category.name}?`
    );
    this.showDeleteModal.set(true);
  }
  
  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.selectedCategory.set(null);
  }
  
  deleteCategory() {
    const category = this.selectedCategory();
    if (!category) return;
  
    const linkedProducts = this.getCategoryProducts(category.id);

    if (linkedProducts.length) {
      this.catStore.deleteCategoryWithProducts(category.id, () => {
            this.closeDeleteModal();
          });
    } else {
      this.catStore.deleteCategory(category.id, () => {
            this.closeDeleteModal();
          });
    }
  }
  
  getCategoryProducts(categoryId: string) {
    return this.prodStore.products().filter(
        product =>
          product.category === categoryId
      );
  }
}