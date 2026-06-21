import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  imports: [FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
})

export class SearchBarComponent {
  query = '';

  @Output() search = new EventEmitter<string>();

  onInput(value: string) {
    this.query = value;
    this.search.emit(value);
  }
}
