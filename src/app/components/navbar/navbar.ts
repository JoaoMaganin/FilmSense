import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { TmdbService } from '../../services/tmdb.service';
import { TmdbMovie } from '../../models/tmdb.model';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../search-bar/search-bar';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, SearchBarComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})

export class NavbarComponent implements OnInit {
  constructor(
    public supabase: SupabaseService,
    private router: Router,
    public tmdb: TmdbService, // It is called directly in the HTML, so it is public
    private cdr: ChangeDetectorRef
  ) { }

  @Output() movieSelected = new EventEmitter<TmdbMovie>();
  userName: string = '';
  searchResults: TmdbMovie[] = [];
  resetSearch = false;

  async ngOnInit() {
    const user = await this.supabase.getUser();
    this.userName = user?.user_metadata?.['full_name'] ?? 'Visitante';
    this.cdr.detectChanges();
  }

  async onSearch(query: string) {
    if (!query.trim()) { // clean the search when input is empty
      this.searchResults = [];
      this.cdr.detectChanges();
      return
    }
    this.searchResults = await this.tmdb.searchMovies(query);
    this.cdr.detectChanges();
  }

  selectMovie(movie: TmdbMovie) {
    this.movieSelected.emit(movie);
    this.searchResults = [];
    this.resetSearch = !this.resetSearch;
    this.cdr.detectChanges()
  }

  async signOut() {
    await this.supabase.signOut();
    this.router.navigate(['/login']);
  }
}
