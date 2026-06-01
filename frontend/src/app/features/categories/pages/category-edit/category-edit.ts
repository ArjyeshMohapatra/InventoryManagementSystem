import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { CategoryForm } from '../../components/category-form/category-form';
import { CategoryStore } from '../../store/category.store';
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
  private categoryStore = inject(CategoryStore);

  catStore = this.categoryStore;

  id = String(this.route.snapshot.paramMap.get('id'));

  form = this.fb.group({name: ['']});
  
  constructor() {
    this.catStore.loadCategoryById(this.id);
    effect(() => {
      const categoryData = this.catStore.selectedCategory();
      if (categoryData) this.form.patchValue(categoryData);
    });
  }

  submit() {
    if (this.form.invalid) return;
    const updatedCategory = { ...this.form.value, id: String(this.id) };
    
    this.catStore.updateCategory(updatedCategory as Category, () => {
        this.router.navigate(['/categories']);
      }
    );
  }
}