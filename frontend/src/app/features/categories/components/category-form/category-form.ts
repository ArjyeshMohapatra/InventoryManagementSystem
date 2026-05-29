import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './category-form.html',
})
export class CategoryForm {
  form = input.required<FormGroup>();
  loading = input(false);
  buttonText = input('Save');
  submitted = output<void>();
  onSubmit() {
    this.submitted.emit();
  }
}