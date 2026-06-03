import { Component, effect, inject, signal, output, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProductForm } from '../../components/product-form/product-form';
import { ProductStore } from '../../store/product.store';
import { Product } from '../../models/product.model';
import { SupplierStore } from 'src/app/features/suppliers/store/supplier.store';
import { InventoryTransactionStore } from 'src/app/features/inventory-transactions/store/inventory-transaction.store';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [ReactiveFormsModule, ProductForm],
  templateUrl: './product-edit.html'
})
export class ProductEdit{

  private fb = inject(FormBuilder);
  private productStore = inject(ProductStore);
  private supplierStore = inject(SupplierStore);
  private transactionStore = inject(InventoryTransactionStore);

  pendingTransactions = signal<{ type:'ADD' | 'REMOVE'; quantity:number }[]>([]);

  suppStore = this.supplierStore;
  prodStore = this.productStore
  tranStore = this.transactionStore;
  saved = output<void>();

  productId = input.required<string>();

  form = this.fb.group({

    name: [''],
    price: [0],
    stock: [0],
    lowStockThreshold: [5],
    category: [''],
    supplierId: ['']

  });
  
  constructor() {
    effect(() => {
      const id = this.productId();
      this.prodStore.loadProductById(id);
    });

    this.suppStore.loadSuppliers();
    effect(() => {
      const productData = this.prodStore.selectedProduct();
      if (productData) {
        this.form.patchValue(productData);
      }
    });
  }

  setTransactions(transactions: { type:'ADD' | 'REMOVE'; quantity:number }[]) {
    this.pendingTransactions.set(transactions);
  }

  submit() {
    if (this.form.invalid || this.prodStore.loading()) return;
    const updatedProduct = { ...this.form.value, id: String(this.productId()) };
    
    this.prodStore.updateProduct(updatedProduct as Product, () => {
      const transactions = this.pendingTransactions();
  
      transactions.forEach(transaction => {
        this.tranStore.addTransaction({
          id: crypto.randomUUID(),
          productId: this.productId(),
          type: transaction.type,
          quantity: transaction.quantity,
          date: new Date().toISOString()
        });
  
      });
      this.saved.emit();
    });
  }
}