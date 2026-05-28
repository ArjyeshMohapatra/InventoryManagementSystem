import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';

import { ActivatedRoute } from '@angular/router';

import { ProductRepository } from '../../../../core/api/repositories/product.repository';

import { ProductStore } from '../../store/product.store';

import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './product-edit.html'
})
export class ProductEdit implements OnInit {

  private fb = inject(FormBuilder);

  private router = inject(Router);

  private route = inject(ActivatedRoute);

  private repo = inject(ProductRepository);

  private store = inject(ProductStore);

  id = this.route.snapshot.params['id'];

  form = this.fb.group({

    name: [''],
    price: [0],
    quantity: [0],
    category: ['']

  });

  ngOnInit(): void {

    this.repo.getProductById(Number(this.id))
      .subscribe(product => {

        this.form.patchValue(product);

      });

  }

  submit() {

    const updatedProduct = {

      ...this.form.value,

      id: Number(this.id)

    };

    this.store.updateProduct(
      updatedProduct as Product
    );
    this.router.navigate(['/products']);
  }

}