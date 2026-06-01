import { Component, input, output,inject, computed } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CategoryStore } from 'src/app/features/categories/store/category.store';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './product-form.html'
})
export class ProductForm {
  private categoryStore = inject(CategoryStore);
  catStore = this.categoryStore;

  form = input.required<FormGroup>();
  loading = input(false);
  buttonText = input('Save');
  submitted = output<void>();
  
  onSubmit() {
    this.submitted.emit();
  }

  categoryOptions = computed(() => {
    const categories = this.catStore.categories();
    return categories.map(category => ({
      label: category.name,
      value: category.id
    }));
  })
}