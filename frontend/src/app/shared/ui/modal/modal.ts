import { Component, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faC, faClose } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [FontAwesomeModule],
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
  showFooter = input(true);

  close = faClose;

  confirm() { this.confirmed.emit() }
  cancel() { this.cancelled.emit() }
}
