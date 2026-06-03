import { Component, input, output,inject, computed, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CategoryStore } from 'src/app/features/categories/store/category.store';
import { Modal } from '@shared/ui';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, Modal],
  templateUrl: './product-form.html'
})
export class ProductForm {
  private categoryStore = inject(CategoryStore);
  catStore = this.categoryStore;

  form = input.required<FormGroup>();
  suppliers = input<any[]>([]);
  loading = input(false);
  buttonText = input('Save');
  isEditMode = input(false);
  submitted = output<void>();
  showStockModal = signal(false);
  stockMessage = signal('');
  
  onSubmit() {
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