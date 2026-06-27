import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { TmdbMovie } from '../models/tmdb.model';


@Injectable({ providedIn: 'root' })
export class TmdbService {
  private baseUrl = 'https://api.themoviedb.org/3';
  private headers = {
    Authorization: `Bearer ${environment.tmdbToken}`,
    'Content-Type': 'application/json'
  };

  // Busca filmes pelo nome (para o campo de busca)
  async searchMovies(query: string): Promise<TmdbMovie[]> {
    const res = await fetch(
      `${this.baseUrl}/search/movie?query=${encodeURIComponent(query)}&language=pt-BR`,
      { headers: this.headers }
    );
    const data = await res.json();
    return data.results ?? [];
  }

  // Busca filmes populares (para gerar recomendações)
  async getPopularMovies(page = 1): Promise<TmdbMovie[]> {
    const res = await fetch(
      `${this.baseUrl}/movie/popular?language=pt-BR&page=${page}`,
      { headers: this.headers }
    );
    const data = await res.json();
    return data.results ?? [];
  }

  // URL do poster
  getPosterUrl(posterPath: string): string {
    return `https://image.tmdb.org/t/p/w300${posterPath}`;
  }

  // Ano a partir da data
  getReleaseYear(releaseDate: string): number {
    return parseInt(releaseDate?.split('-')[0] ?? '0');
  }

  async getMovieDetails(tmdbId: number): Promise<TmdbMovie> {
    const res = await fetch(
      `${this.baseUrl}/movie/${tmdbId}?language=pt-BR`,
      { headers: this.headers }
    );
    const data = await res.json();
    return data;
  }
}