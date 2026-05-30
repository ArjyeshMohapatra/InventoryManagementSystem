import { Component, input, output,inject, computed } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CategoryQueryService } from '../../../categories/queryService/category.query.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './product-form.html'
})
export class ProductForm {
  private categoryQueryService = inject(CategoryQueryService);

  categoriesQuery = this.categoryQueryService.getCategoriesQuery();

  form = input.required<FormGroup>();
  loading = input(false);
  buttonText = input('Save');
  submitted = output<void>();
  onSubmit() {
    this.submitted.emit();
  }

  categoryOptions = computed(() => {
    const categories = this.categoriesQuery.data() ?? [];
    return categories.map(category => ({
      label: category.name,
      value: category.id
    }));
  })
}