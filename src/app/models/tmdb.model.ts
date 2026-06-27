export interface TmdbMovie {
  id: number;
  title: string;
  genre_ids: number[];
  release_date: string;
  popularity: number;
  poster_path: string;
  overview: string;
  score?: number;
}