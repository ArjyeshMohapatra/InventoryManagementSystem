import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';

import { Router } from '@angular/router';

import { ProductStore } from '../../store/product.store';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './product-create.html'
})
export class ProductCreate {

  private fb = inject(FormBuilder);

  private store = inject(ProductStore);

  private router = inject(Router);

  form = this.fb.group({

    name: [''],
    price: [0],
    quantity: [0],
    category: ['']

  });

  submit() {
    this.store.addProduct(this.form.value as Product)
    this.router.navigate(['/products']);
  }

}