import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar';
import { TmdbMovie } from '../../models/tmdb.model';
import { Rating } from '../../models/rating.model';
import { SupabaseService } from '../../services/supabase.service';
import { RatingModal } from '../../components/rating-modal/rating-modal';
import { CommonModule, SlicePipe } from '@angular/common';
import * as tf from '@tensorflow/tfjs';
import { trainModel } from '../../ml/model';
import { recommend } from '../../ml/recommend';
import { TmdbService } from '../../services/tmdb.service';

@Component({
  selector: 'app-home',
  imports: [NavbarComponent, RatingModal, CommonModule, SlicePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  constructor(
    public supabase: SupabaseService,
    private tmdbService: TmdbService,
    private cdr: ChangeDetectorRef,
  ) { }

  ratings: Rating[] = [];
  model: tf.Sequential | null = null;
  recommendations: TmdbMovie[] = [];
  isTraining = false;
  showAllRatings = false;

  selectedMovie: TmdbMovie | null = null;
  showConfirmation = false;

  get visibleRatings() {
    return this.showAllRatings ? this.ratings : this.ratings.slice(0, 6);
  }

  async onMovieSelected(movie: TmdbMovie) {
    const details = await this.tmdbService.getMovieDetails(movie.id);
    this.selectedMovie = {
      ...movie,
      ...details,
    };
    this.cdr.detectChanges();
  }

  onModalClose() {
    this.selectedMovie = null;
  }

  async ngOnInit() {
    this.supabase.onAuthChange(async (user) => {
      if (user || this.supabase.isGuest) {
        this.ratings = [...await this.supabase.getRatings()];
        this.cdr.detectChanges();
      }
    });

    // fallback para visitante (não tem evento de auth)
    if (this.supabase.isGuest) {
      this.ratings = [...await this.supabase.getRatings()];
    }
  }

  async onRated(rating: Rating) {
    await this.supabase.saveRating(rating);
    this.ratings = [...await this.supabase.getRatings()];
    this.showConfirmation = true;
    this.cdr.detectChanges();
    setTimeout(() => this.showConfirmation = false, 3000);
  }

  async onRatingSelected(rating: Rating) {
    const details = await this.tmdbService.getMovieDetails(rating.tmdb_id);
    this.selectedMovie = {
      ...details,
      id: rating.tmdb_id,
      genre_ids: details.genre_ids ?? rating.genres,
    };
    this.cdr.detectChanges
  }

  async onRecommend() {
    this.isTraining = true;
    this.model = await trainModel(this.ratings);
    this.isTraining = false;
    this.cdr.detectChanges();

    const pages = await Promise.all([1, 2, 3, 4, 5].map(p => this.tmdbService.getPopularMovies(p)));
    const popularMovies = pages.flat();
    const ratedIds = this.ratings.map(rating => rating.tmdb_id);
    this.recommendations = await recommend(this.model!, popularMovies, ratedIds);
    this.cdr.detectChanges();
  }
}
