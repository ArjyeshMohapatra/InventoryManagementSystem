import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-search-input',
  standalone: true,
  templateUrl: './search-input.html',
  styleUrl: './search-input.css',
})
export class SearchInput {
  value = input('');
  placeholder = input('Search ...');
  valueChanged = output<string>();

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.valueChanged.emit(input.value);
  }
}
