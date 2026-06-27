export interface TmdbMovie {
  id: number;
  title: string;
  genre_ids: number[];
  genres?: { id: number; name: string }[];
  release_date: string;
  popularity: number;
  poster_path: string;
  overview: string;
  score?: number;
}