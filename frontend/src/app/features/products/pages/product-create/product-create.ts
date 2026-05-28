import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';

import { Router } from '@angular/router';

import { ProductQueryService } from '../../queryService/product.query.service';import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './product-create.html'
})
export class ProductCreate {

  private fb = inject(FormBuilder);

  private productQueryService = inject(ProductQueryService);
  private router = inject(Router);

  addMutation = this.productQueryService.addProductMutation();

  form = this.fb.group({

    name: [''],
    price: [0],
    quantity: [0],
    category: ['']

  });

  submit() {
    if (this.form.invalid || this.addMutation.isPending()) return;
    this.addMutation.mutate(this.form.value as Product, {
      onSuccess: () => {
        this.router.navigate(['/products']);
      }
    });
  }

}