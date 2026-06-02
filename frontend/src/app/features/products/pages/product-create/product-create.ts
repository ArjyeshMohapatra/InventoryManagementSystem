import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ProductStore } from '../../store/product.store';
import { Product } from '../../models/product.model';
import { ProductForm } from '../../components/product-form/product-form';
import { SupplierStore } from 'src/app/features/suppliers/store/supplier.store';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [ReactiveFormsModule, ProductForm],
  templateUrl: './product-create.html'
})
export class ProductCreate {

  private fb = inject(FormBuilder);
  public productStore = inject(ProductStore);
  private router = inject(Router);
  private supplierStore = inject(SupplierStore);

  suppStore = this.supplierStore;
  prodStore = this.productStore;

  form = this.fb.group({

    name: [''],
    price: [0],
    quantity: [0],
    category: [''],
    supplier: ['']

  });

  constructor() {
    this.suppStore.loadSuppliers();
  }

  submit() {
    if (this.form.invalid || this.prodStore.loading()) return;
    this.prodStore.addProduct(this.form.value as Product, () => {
        this.router.navigate(['/products']);
      }
    );
  }

}