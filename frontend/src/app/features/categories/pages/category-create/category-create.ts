import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CategoryStore } from '../../store/category.store';
import { Category } from '../../models/category.model';
import { CategoryForm } from '../../components/category-form/category-form';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [ReactiveFormsModule, CategoryForm],
  templateUrl: './category-create.html'
})
export class CategoryCreate {

  private fb = inject(FormBuilder);

  private categoryStore = inject(CategoryStore);
  private router = inject(Router);

  catStore = this.categoryStore;

  form = this.fb.group({name: ['']});

  submit() {
    if (this.form.invalid || this.catStore.loading()) return;
    this.catStore.addCategory(this.form.value as Category, () => {
        this.router.navigate(['/categories']);
      }
    );
  }

}