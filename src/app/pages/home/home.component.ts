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

  trainingStatus = '';

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
        this.onRecommend();
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

    if (this.ratings.length >= 3) {
      await this.onRecommend();
    } else {
      this.recommendations = this.recommendations.filter(
        m => m.id !== rating.tmdb_id
      );
    }

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

  getTopGenres(n: number): number[] {
    const genreScores: Record<number, number> = {};

    this.ratings
      .filter(r => r.rating >= 7)
      .forEach(rating => {
        rating.genres.forEach(genre => {
          genreScores[genre] = (genreScores[genre] ?? 0) + rating.rating;
        });
      });

    return Object.entries(genreScores)
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .slice(0, n)
      .map(([id]) => Number(id));
  }

  async getTopKeywords(n: number): Promise<number[]> {
    const goodRatings = this.ratings.filter(r => r.rating > 7);

    const keywordCounts: Record<number, number> = {};

    await Promise.all(
      goodRatings.map(async rating => {
        const keywords = await this.tmdbService.getMovieKeywords(rating.tmdb_id);
        keywords.forEach(id => {
          keywordCounts[id] = (keywordCounts[id] ?? 0) + 1;
        });
      })
    );

    return Object.entries(keywordCounts)
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .slice(0, n)
      .map(([id]) => Number(id));
  }

  async onRecommend() {
    this.isTraining = true;
    this.trainingStatus = 'Analisando seu histórico...';
    this.cdr.detectChanges();

    const topGenres = this.getTopGenres(3);
    const topKeywords = await this.getTopKeywords(5);

    this.trainingStatus = 'Buscando candidatos e treinando modelo...';
    this.cdr.detectChanges();

    // treino e busca em paralelo
    const [trainedModel, ...results] = await Promise.all([
      trainModel(this.ratings),
      ...([1, 2, 3].map(p => this.tmdbService.getPopularMovies(p))),
      ...([1, 2].map(p => this.tmdbService.getTopRatedMovies(p))),
      ...topGenres.map(g => this.tmdbService.getMoviesByGenre(g)),
      ...topKeywords.map(k => this.tmdbService.getMoviesByKeyword(k))
    ]);

    this.model = trainedModel as tf.Sequential;

    const allMovies = (results as TmdbMovie[][]).flat();
    const seen = new Set<number>();
    const candidates = allMovies.filter(movie => {
      if (seen.has(movie.id)) return false;
      seen.add(movie.id);
      return true;
    });

    const ratedIds = this.ratings.map(r => r.tmdb_id);
    this.recommendations = await recommend(this.model!, candidates, ratedIds);
    this.trainingStatus = '';
    this.isTraining = false;
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
