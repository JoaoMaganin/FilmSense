import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar';
import { TmdbMovie } from '../../models/tmdb.model';
import { Rating } from '../../models/rating.model';
import { SupabaseService } from '../../services/supabase.service';
import { RatingModal } from '../../components/rating-modal/rating-modal';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [NavbarComponent, RatingModal, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  constructor(
    public supabase: SupabaseService,
    private cdr: ChangeDetectorRef
  ) { }

  ratings: Rating[] = [];

  selectedMovie: TmdbMovie | null = null;
  showConfirmation = false;

  onMovieSelected(movie: TmdbMovie) {
    this.selectedMovie = movie;
  }

  onModalClose() {
    this.selectedMovie = null;
  }

  // async ngOnInit() {
  //   this.ratings = await this.supabase.getRatings();
  // }

  async ngOnInit() {
    this.supabase.onAuthChange(async (user) => {
      if (user || this.supabase.isGuest) {
        this.ratings = [...await this.supabase.getRatings()];
        this.cdr.detectChanges();
        console.log('ratings carregados:', this.ratings.length);
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
    console.log('ratings length:', this.ratings.length);
    console.log('ratings:', this.ratings);
    this.showConfirmation = true;
    setTimeout(() => this.showConfirmation = false, 3000);
  }
}
