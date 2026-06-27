export interface Rating {
  id?: string;
  user_id?: string;
  tmdb_id: number;
  title: string;
  rating: number;
  genres: number[];
  release_year: number;
  popularity: number;
  poster_path?: string;
  backdrop_path?: string;
}