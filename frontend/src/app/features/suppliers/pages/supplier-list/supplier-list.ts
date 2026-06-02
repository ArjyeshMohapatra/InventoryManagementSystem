import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SearchInput } from '../../../../shared/ui/search-input/search-input';
import { Table } from '../../../../shared/ui/table/table';
import { Modal } from '../../../../shared/ui/modal/modal';

import { SupplierStore } from '../../store/supplier.store';
import { Supplier } from '../../models/supplier.model';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [RouterLink, SearchInput, Table, Modal],
  templateUrl: './supplier-list.html',
})
export class SupplierList {
  private supplierStore = inject(SupplierStore);

  suppStore = this.supplierStore;

  searchInput = signal('');
  searchTerm = signal('');

  columns = ['name', 'email', 'phone', 'address'];

  actions = true;

  selectedSupplier = signal<Supplier | null>(null);
  showDeleteModal = signal(false);

  constructor() {
    this.suppStore.loadSuppliers();

    effect((onCleanup) => {
      const value = this.searchInput();

      const timer = setTimeout(() => {
        this.searchTerm.set(value);
      }, 300);

      onCleanup(() => {
        clearTimeout(timer);
      });
    });
  }

  filteredSuppliers = computed(() => {
    const suppliers = this.suppStore.suppliers();
    const term = this.searchTerm().toLowerCase().trim();

    return suppliers.filter(
      (supplier) => !term || supplier.name.toLowerCase().includes(term)
    );
  });

  openDeleteModal(supplier: Supplier) {
    this.selectedSupplier.set(supplier);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.selectedSupplier.set(null);
  }

  deleteSupplier() {
    const supplier = this.selectedSupplier();

    if (!supplier) return;

    this.suppStore.deleteSupplier(supplier.id, () => {
      this.closeDeleteModal();
    });
  }
}