import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  imports: [FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
})

export class SearchBarComponent implements OnChanges {
  query = '';

  @Output() search = new EventEmitter<string>();
  @Input() reset = false;

  onInput(value: string) {
    this.query = value;
    this.search.emit(value);
  }

  ngOnChanges() {
    if (this.reset) {
      this.query = '';
    }
  }
}
