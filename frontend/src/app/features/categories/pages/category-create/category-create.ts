import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CategoryQueryService } from '../../queryService/category.query.service';
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

  private categoryQueryService = inject(CategoryQueryService);
  private router = inject(Router);

  addMutation = this.categoryQueryService.addCategoryMutation();

  form = this.fb.group({name: ['']});

  submit() {
    if (this.form.invalid || this.addMutation.isPending()) return;
    this.addMutation.mutate(this.form.value as Category, {
      onSuccess: () => {
        this.router.navigate(['/categories']);
      }
    });
  }

}