import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ProductStore } from '../../store/product.store';
import { Product } from '../../models/product.model';
import { ProductForm } from '../../components/product-form/product-form';

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

  prodStore = this.productStore;

  form = this.fb.group({

    name: [''],
    price: [0],
    quantity: [0],
    category: ['']

  });

  submit() {
    if (this.form.invalid || this.prodStore.loading()) return;
    this.prodStore.addProduct(this.form.value as Product, () => {
        this.router.navigate(['/products']);
      }
    );
  }

}