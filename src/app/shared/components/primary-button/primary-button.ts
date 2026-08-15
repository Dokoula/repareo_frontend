import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-primary-button',
  standalone: true,
  templateUrl: './primary-button.html',
  styleUrl: './primary-button.css',
})
export class PrimaryButton {
  text = input.required<string>();
  icon = input<string>('');
  type = input<'button' | 'submit'|'reset'>('button');
  disabled = input(false);
  loading = input(false);
  fullWidth = input(false);
  clicked = output<void>();

  onClick() {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit();
    }
  }
}
