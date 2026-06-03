import { Component, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

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
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private productStore = inject(ProductStore);
  private supplierStore = inject(SupplierStore);
  private transactionStore = inject(InventoryTransactionStore);

  pendingTransactions = signal<{ type:'ADD' | 'REMOVE'; quantity:number }[]>([]);

  suppStore = this.supplierStore;
  prodStore = this.productStore
  tranStore = this.transactionStore;

  id = String(this.route.snapshot.paramMap.get('id'));

  form = this.fb.group({

    name: [''],
    price: [0],
    stock: [0],
    lowStockThreshold: [5],
    category: [''],
    supplierId: ['']

  });
  
  constructor() {
    this.prodStore.loadProductById(this.id);
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
    const updatedProduct = { ...this.form.value, id: String(this.id) };
    
    this.prodStore.updateProduct(updatedProduct as Product, () => {
      const transactions = this.pendingTransactions();
  
      transactions.forEach(transaction => {
        this.tranStore.addTransaction({
          id: crypto.randomUUID(),
          productId: this.id,
          type: transaction.type,
          quantity: transaction.quantity,
          date: new Date().toISOString()
        });
  
      });
      this.router.navigate(['/products']);
    });
  }
}