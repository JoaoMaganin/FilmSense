import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SupabaseService } from './services/supabase.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App implements OnInit {
  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.supabase.onAuthChange(user => {
      if (user) {
        this.router.navigate(['/']);
      } else if (!this.supabase.isGuest) {
        this.router.navigate(['/login']);
      }
    });
  }
}
