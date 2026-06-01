import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { ProductForm } from '../../components/product-form/product-form';
import { ProductStore } from '../../store/product.store';
import { Product } from '../../models/product.model';

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
  prodStore = this.productStore

  id = String(this.route.snapshot.paramMap.get('id'));

  

  form = this.fb.group({

    name: [''],
    price: [0],
    quantity: [0],
    category: ['']

  });
  
  constructor() {
    this.prodStore.loadProductById(this.id);
    effect(() => {
      const productData = this.prodStore.selectedProduct();
      if (productData) {
        this.form.patchValue(productData);
      }
    });
  }

  submit() {
    if (this.form.invalid || this.prodStore.loading()) return;
    const updatedProduct = { ...this.form.value, id: String(this.id) };
    
    this.prodStore.updateProduct(updatedProduct as Product, () => {
        this.router.navigate(['/products']);
      }
    );
  }
}