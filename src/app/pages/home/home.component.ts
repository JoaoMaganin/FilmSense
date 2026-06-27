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
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-home',
  imports: [NavbarComponent, RatingModal, CommonModule, SlicePipe, ConfirmDialog],
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

  toastMessage = '';

  ratingToDelete: Rating | null = null;

  currentRating = 0;

  get visibleRatings() {
    return this.showAllRatings ? this.ratings : this.ratings.slice(0, 6);
  }

  async onMovieSelected(movie: TmdbMovie) {
    this.currentRating = 0;
    this.selectedMovie = movie;
  }

  onModalClose() {
    this.currentRating = 0;
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
      await this.loadGuestSuggestions();
      this.cdr.detectChanges();
    }
  }

  async loadGuestSuggestions() {
    const popular = await this.tmdbService.getPopularMovies(1);
    this.recommendations = popular;
    this.cdr.detectChanges();
  }

  async onRated(rating: Rating) {
    await this.supabase.saveRating(rating);
    this.ratings = [...await this.supabase.getRatings()];
    this.showToast('Avaliação salva com sucesso!');
    this.cdr.detectChanges();
  }

  async onRatingSelected(rating: Rating) {
    this.currentRating = rating.rating
    const details = await this.tmdbService.getMovieDetails(rating.tmdb_id);
    this.selectedMovie = {
      ...details,
      id: rating.tmdb_id,
      genre_ids: details.genre_ids ?? rating.genres,
    };
    this.cdr.detectChanges();
  }

  async onRecommend() {
    this.isTraining = true;
    this.model = await trainModel(this.ratings);
    this.isTraining = false;
    this.cdr.detectChanges();

    const pages = await Promise.all([1, 2, 3, 4, 5].map(p => this.tmdbService.getPopularMovies(p)));
    const allMovies = pages.flat();

    const seen = new Set<number>();
    const popularMovies = allMovies.filter(movie => {
      if (seen.has(movie.id)) return false;
      seen.add(movie.id);
      return true;
    });

    const ratedIds = this.ratings.map(rating => rating.tmdb_id);
    this.recommendations = await recommend(this.model!, popularMovies, ratedIds);
    this.cdr.detectChanges();
  }

  onDeleteRating(rating: Rating, event: Event) {
    event.stopPropagation();
    this.ratingToDelete = rating;
  }

  async onConfirmDelete() {
    if (!this.ratingToDelete) return;
    await this.supabase.deleteRating(this.ratingToDelete.tmdb_id);
    this.ratings = [...await this.supabase.getRatings()];
    this.ratingToDelete = null;
    this.showToast('Avaliação excluída com sucesso!');
    this.cdr.detectChanges();
  }

  onCancelDelete() {
    this.ratingToDelete = null;
  }

  showToast(message: string) {
    this.toastMessage = message;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toastMessage = '';
      this.cdr.detectChanges();
    }, 3000);
  }
}
