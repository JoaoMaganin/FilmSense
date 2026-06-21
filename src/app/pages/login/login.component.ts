import { Component } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})

export class LoginComponent {
  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async loginWithGoogle() {
    await this.supabase.signInWithGoogle();
  }

  enterAsGuest() {
    this.supabase.enterAsGuest();
    this.router.navigate(['/']);
  }
}
