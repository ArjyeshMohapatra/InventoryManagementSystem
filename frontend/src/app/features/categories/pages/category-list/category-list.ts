import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SearchInput } from '../../../../shared/ui/search-input/search-input';
import { Table } from '../../../../shared/ui/table/table';
import { CategoryQueryService } from '../../queryService/category.query.service';
import { Modal } from '../../../../shared/ui/modal/modal';
import { ProductRepository } from '../../../../core/api/repositories/product.repository';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [RouterLink, SearchInput, Table, Modal],
  templateUrl: './category-list.html',
})
export class CategoryList {
  private categoryQueryService = inject(CategoryQueryService);
  private productRepo = inject(ProductRepository);

  categoriesQuery = this.categoryQueryService.getCategoriesQuery();
  searchInput = signal('');
  searchTerm = signal('');
  columns = ['name'];
  actions = true;
  deleteMutation = this.categoryQueryService.deleteCategoryWithProductsMutation();
  selectedCategory = signal<any>(null);
  showDeleteModal = signal(false);
  deleteMessage = signal('');

  constructor() {
    effect((onCleanup) => {
      const value = this.searchInput();
      const timer = setTimeout(() => this.searchTerm.set(value), 300);
      onCleanup(() => clearTimeout(timer));
    });
  }

  filteredCategories = computed(() => {
    const categories = this.categoriesQuery.data() ?? [];
    const term = this.searchTerm().toLowerCase().trim();
    return categories.filter((category) => !term || category.name.toLowerCase().includes(term));
  });

  async openDeleteModal(category: any) {
    this.selectedCategory.set(category);
    const products = await lastValueFrom(this.productRepo.getProductsByCategory(category.id));
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
  }
  
  deleteCategory() {
    const category = this.selectedCategory();
    if (!category) return;
  
    this.deleteMutation.mutate(category.id, {
      onSuccess: () => {
        this.closeDeleteModal();
      },
    });
  }
}