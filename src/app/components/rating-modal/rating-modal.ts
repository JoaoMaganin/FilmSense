import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TmdbMovie } from '../../models/tmdb.model';
import { Rating } from '../../models/rating.model';
import { TmdbService } from '../../services/tmdb.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rating-modal',
  imports: [CommonModule],
  templateUrl: './rating-modal.html',
  styleUrl: './rating-modal.scss',
})
export class RatingModal {
  constructor(
    public tmdb: TmdbService
  ) {}

  @Input() movie: TmdbMovie | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() rated = new EventEmitter<Rating>();
  hoveredNote = 0;

  confirm(nota: number) {
    if (!this.movie) return;

    const rating: Rating = {
      tmdb_id: this.movie.id,
      title: this.movie.title,
      rating: nota,
      genres: this.movie.genre_ids,
      release_year: this.tmdb.getReleaseYear(this.movie.release_date),
      popularity: this.movie.popularity
    };

    this.rated.emit(rating);
    this.close.emit();
  }
}
