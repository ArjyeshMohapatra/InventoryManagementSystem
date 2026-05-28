import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { ProductForm } from '../../components/product-form/product-form';
import { ProductQueryService } from '../../queryService/product.query.service';
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
  private productQueryService = inject(ProductQueryService);

  id = String(this.route.snapshot.paramMap.get('id'));

  updateMutation = this.productQueryService.updateProductMutation();
  productQuery = this.productQueryService.getProductQuery(() => this.id);

  form = this.fb.group({

    name: [''],
    price: [0],
    quantity: [0],
    category: ['']

  });

  constructor() {
    effect(() => {
      // Reactively patch the form whenever the cached data resolves successfully
      const productData = this.productQuery.data();
      if (productData) this.form.patchValue(productData);
    });
  }

  submit() {
    if (this.form.invalid) return;
    const updatedProduct = { ...this.form.value, id: Number(this.id) };
    
    this.updateMutation.mutate(updatedProduct as Product, {
      onSuccess: () => {
        // Navigate away ONLY after the backend has officially updated the item!
        this.router.navigate(['/products']);
      }
    });
  }
}