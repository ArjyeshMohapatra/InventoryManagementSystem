import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './product-form.html'
})
export class ProductForm {
  form = input.required<FormGroup>();
  loading = input(false);
  buttonText = input('Save');
  submitted = output<void>();
  onSubmit() {
    this.submitted.emit();
  }

}