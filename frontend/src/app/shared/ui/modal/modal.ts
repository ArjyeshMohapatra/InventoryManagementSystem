import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  open = input(false);
  title = input('Confirm Action');
  message = input('');
  confirmed = output<void>();
  cancelled = output<void>();
  confirmText = input('Confirm');
  cancelText = input('Cancel');
  showConfirm = input(true);

  confirm() { this.confirmed.emit() }
  cancel() { this.cancelled.emit() }
}
