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

  async getTopRatedMovies(page = 1): Promise<TmdbMovie[]> {
    const res = await fetch(
      `${this.baseUrl}/movie/top_rated?language=pt-BR&page=${page}`,
      { headers: this.headers }
    );
    const data = await res.json();
    return data.results ?? [];
  }
  
  async getMoviesByGenre(genreId: number, page = 1): Promise<TmdbMovie[]> {
    const res = await fetch(
      `${this.baseUrl}/discover/movie?with_genres=${genreId}&language=pt-BR&page=${page}&sort_by=vote_average.desc&vote_count.gte=100`,
      { headers: this.headers }
    );
    const data = await res.json();
    return data.results ?? [];
  }

  async getMovieDetails(tmdbId: number): Promise<TmdbMovie> {
    const res = await fetch(
      `${this.baseUrl}/movie/${tmdbId}?language=pt-BR`,
      { headers: this.headers }
    );
    const data = await res.json();
    return data;
  }

  async getMovieKeywords(tmdbId: number): Promise<number[]> {
    const res = await fetch(
      `${this.baseUrl}/movie/${tmdbId}/keywords`,
      { headers: this.headers }
    );
    const data = await res.json();
    return data.keywords?.map((k: { id: number }) => k.id) ?? [];
  }
  
  async getMoviesByKeyword(keywordId: number): Promise<TmdbMovie[]> {
    const res = await fetch(
      `${this.baseUrl}/discover/movie?with_keywords=${keywordId}&language=pt-BR&sort_by=vote_average.desc&vote_count.gte=100`,
      { headers: this.headers }
    );
    const data = await res.json();
    return data.results ?? [];
  }
}