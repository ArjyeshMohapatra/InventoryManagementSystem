import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SearchInput } from '../../../../shared/ui/search-input/search-input';
import { Table } from '../../../../shared/ui/table/table';
import { Modal } from '../../../../shared/ui/modal/modal';

import { SupplierStore } from '../../store/supplier.store';
import { ProductStore } from 'src/app/features/products/store/product.store';
import { Supplier } from '../../models/supplier.model';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [RouterLink, SearchInput, Table, Modal],
  templateUrl: './supplier-list.html',
})
export class SupplierList {
  private supplierStore = inject(SupplierStore);
  private productStore = inject(ProductStore);

  suppStore = this.supplierStore;
  prodStore = this.productStore;

  searchInput = signal('');
  searchTerm = signal('');

  columns = [
    'id',
    'name',
    'company',
    'contactPerson',
    'contactPersonGender',
    'email',
    'phone',
    'website',
    'gstNumber'
  ];

  actions = true;

  selectedSupplier = signal<Supplier | null>(null);
  showDeleteModal = signal(false);
  deleteMessage = signal('');

  constructor() {
    this.suppStore.loadSuppliers();
    this.prodStore.loadProducts();

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
    const products = this.getSupplierProducts(supplier.id);
    const count = products.length;
    this.deleteMessage.set(
      count > 0 ? 
        `${supplier.name} Contains ${count} Linked Products. Deleting This SUpplier Will Also Remove Those Products.`
        : `This action can't be undone, still want to delete Supplier ${supplier.name}?`
    );
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.selectedSupplier.set(null);
  }

  deleteSupplier() {
    const supplier = this.selectedSupplier();

    if (!supplier) return;

    const linkedProducts = this.getSupplierProducts(supplier.id);

    if (linkedProducts.length) {
      this.suppStore.deleteSupplierWithProducts(supplier.id, () => {
            this.closeDeleteModal();
          });
    } else {
      this.suppStore.deleteSupplier(supplier.id, () => {
            this.closeDeleteModal();
          });
    }
  }

  getSupplierProducts(supplierId: string) {
    return this.prodStore.products().filter(
        product =>
          product.supplierId === supplierId
      );
  }
}