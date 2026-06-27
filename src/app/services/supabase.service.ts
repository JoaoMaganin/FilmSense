import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment.development';
import { Rating } from '../models/rating.model';


@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;
  private guestMode = false;
  private guestRatings: Rating[] = [];

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  enterAsGuest() {
    this.guestMode = true;
  }

  get isGuest(): boolean {
    return this.guestMode;
  }

  // Auth
  signInWithGoogle() {
    return this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  }

  async signOut() {
    this.guestMode = false;
    this.guestRatings = [];
    await this.supabase.auth.signOut();
  }

  // signOut() {
  //   return this.supabase.auth.signOut();
  // }

  getUser(): Promise<User | null> {
    return this.supabase.auth.getUser().then(({ data }) => data.user);
  }

  onAuthChange(callback: (user: User | null) => void) {
    return this.supabase.auth.onAuthStateChange((_, session) => {
      callback(session?.user ?? null);
    });
  }

  // Ratings
  async getRatings(): Promise<Rating[]> {
    if (this.guestMode) {
      return this.guestRatings;
    }

    const { data, error } = await this.supabase
      .from('ratings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  async saveRating(rating: Rating): Promise<void> {
    const user = await this.getUser();

    if (this.guestMode) {
      const filmIndex = this.guestRatings.findIndex(film => film.tmdb_id === rating.tmdb_id);
      if (filmIndex !== -1) {
        this.guestRatings[filmIndex] = rating;
      } else {
        this.guestRatings.push(rating);
      }
      return;
    }

    const { error } = await this.supabase
      .from('ratings')
      .upsert(
        {...rating, user_id: user?.id}, 
        { onConflict: 'user_id,tmdb_id' }
      );

    if (error) throw error;
  }

  async deleteRating(tmdbId: number): Promise<void> {
    if (this.guestMode) {
      let deletedFilmTmdbId = this.guestRatings.findIndex(film => film.tmdb_id === tmdbId);

      if (deletedFilmTmdbId !== -1) {
        this.guestRatings.splice(deletedFilmTmdbId, 1)
      }
      return;
    }

    const { error } = await this.supabase
      .from('ratings')
      .delete()
      .eq('tmdb_id', tmdbId);

    if (error) throw error;
  }
}