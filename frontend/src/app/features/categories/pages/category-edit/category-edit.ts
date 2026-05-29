import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { CategoryForm } from '../../components/category-form/category-form';
import { CategoryQueryService } from '../../queryService/category.query.service';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [ReactiveFormsModule, CategoryForm],
  templateUrl: './category-edit.html'
})
export class CategoryEdit{

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private categoryQueryService = inject(CategoryQueryService);

  id = String(this.route.snapshot.paramMap.get('id'));

  updateMutation = this.categoryQueryService.updateCategoryMutation();
  categoryQuery = this.categoryQueryService.getCategoryQuery(() => this.id);

  form = this.fb.group({name: ['']});
  
  constructor() {
    effect(() => {
      // Reactively patch the form whenever the cached data resolves successfully
      const categoryData = this.categoryQuery.data();
      if (categoryData) this.form.patchValue(categoryData);
    });
  }

  submit() {
    if (this.form.invalid) return;
    const updatedCategory = { ...this.form.value, id: String(this.id) };
    
    this.updateMutation.mutate(updatedCategory as Category, {
      onSuccess: () => {
        // Navigate away ONLY after the backend has officially updated the item!
        this.router.navigate(['/categories']);
      }
    });
  }
}