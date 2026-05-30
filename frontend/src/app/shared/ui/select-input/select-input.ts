import { Component, input, output } from '@angular/core';
import { SelectOption } from '../../models/select.dropdown.model';

@Component({
  selector: 'app-select-input',
  standalone: true,
  templateUrl: './select-input.html',
  styleUrl: './select-input.css',
})
export class SelectInput {
  value = input('');
  options = input<SelectOption[]>([]);
  valueChanged = output<string>();

  onChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.valueChanged.emit(select.value);
  }
}
