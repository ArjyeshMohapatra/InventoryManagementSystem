import { Component, input, output,inject, computed, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CategoryStore } from 'src/app/features/categories/store/category.store';
import { Modal } from '@shared/ui';
import { InventoryTransaction } from 'src/app/features/inventory-transactions/models/inventory-transaction.model';
import { InventoryTransactionStore } from 'src/app/features/inventory-transactions/store/inventory-transaction.store';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, Modal],
  templateUrl: './product-form.html'
})
export class ProductForm {
  private categoryStore = inject(CategoryStore);
  private transactionStore = inject(InventoryTransactionStore);

  catStore = this.categoryStore;
  tranStore = this.transactionStore;

  form = input.required<FormGroup>();
  suppliers = input<any[]>([]);
  loading = input(false);
  buttonText = input('Save');
  isEditMode = input(false);
  submitted = output<void>();
  showStockModal = signal(false);
  stockMessage = signal('');
  pendingTransactions = signal<Pick<InventoryTransaction, 'type' | 'quantity'>[]>([]);
  stockTransactions = output<{ type:'ADD' | 'REMOVE'; quantity:number }[]>();
  
  onSubmit() {
    this.stockTransactions.emit(this.pendingTransactions());
    this.submitted.emit();
  }

  categoryOptions = computed(() => {
    const categories = this.catStore.categories();
    return categories.map(category => ({
      label: category.name,
      value: category.id
    }));
  });

  addStock(quantity: number, qtyInput: HTMLInputElement) {
    if (!quantity || quantity <= 0) return;
  
    const current = this.form().get('stock')?.value ?? 0;
    this.form().patchValue({ stock: current + quantity });

    this.pendingTransactions.update(
      transactions => [...transactions,
        {
          type: 'ADD',
          quantity
        }
      ]
    );

    qtyInput.value = '';
  }
  
  removeStock(quantity: number, qtyInput: HTMLInputElement) {
    if (!quantity || quantity <= 0) return;
  
    const current = this.form().get('stock')?.value ?? 0;
    if (quantity > current) {
      this.openStockModal('Cannot remove more than available stock');
      return;
    }
  
    this.form().patchValue({ stock: current - quantity });

    this.pendingTransactions.update(
      transactions => [
        ...transactions,
        {
          type: 'REMOVE',
          quantity
        }
      ]
    );

    qtyInput.value = '';
  }

  openStockModal(message: string) {
    this.stockMessage.set(message);
    this.showStockModal.set(true);
  }

  closeStockModal() {
    this.showStockModal.set(false);
  }
}