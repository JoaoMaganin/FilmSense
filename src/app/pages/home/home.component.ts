import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar';
import { TmdbMovie } from '../../models/tmdb.model';
import { Rating } from '../../models/rating.model';
import { SupabaseService } from '../../services/supabase.service';
import { RatingModal } from '../../components/rating-modal/rating-modal';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home.component',
  imports: [NavbarComponent, RatingModal, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  constructor(
    public supabase: SupabaseService,
  ) {}

  selectedMovie: TmdbMovie | null = null;
  showConfirmation = false;

  onMovieSelected(movie: TmdbMovie) {
    this.selectedMovie = movie;
  }

  onModalClose() {
    this.selectedMovie = null;
  }

  async onRated(rating: Rating) {
    await this.supabase.saveRating(rating);
    this.showConfirmation = true;
    setTimeout(() => this.showConfirmation = false, 3000);
  }
}
