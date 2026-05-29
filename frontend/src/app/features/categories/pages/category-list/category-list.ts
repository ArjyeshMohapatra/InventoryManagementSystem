import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SearchInput } from '../../../../shared/ui/search-input/search-input';
import { Table } from '../../../../shared/ui/table/table';
import { CategoryQueryService } from '../../queryService/category.query.service';
import { Modal } from '../../../../shared/ui/modal/modal';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [RouterLink, SearchInput, Table, Modal],
  templateUrl: './category-list.html',
})
export class CategoryList {
  private categoryQueryService = inject(CategoryQueryService);
  categoriesQuery = this.categoryQueryService.getCategoriesQuery();
  searchInput = signal('');
  searchTerm = signal('');
  columns = ['name'];
  actions = true;
  deleteMutation = this.categoryQueryService.deleteCategoryMutation();
  selectedCategory = signal<any>(null);
  showDeleteModal = signal(false);

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

  openDeleteModal(category: any) {
    this.selectedCategory.set(category);
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