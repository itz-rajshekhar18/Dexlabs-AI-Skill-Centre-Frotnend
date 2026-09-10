import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  imports: [RouterLink, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit, OnDestroy {
  protected readonly isNight = signal(false);
  protected readonly currentTime = signal('');
  private clock?: ReturnType<typeof setInterval>;

  protected readonly isHome = signal(true);

  constructor(private readonly router: Router) {
    this.isHome.set(this.router.url === '/' || this.router.url === '');
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.isHome.set((event as NavigationEnd).urlAfterRedirects === '/');
    });
  }

  ngOnInit(): void {
    this.updateTheme();
    this.clock = setInterval(() => this.updateTheme(), 60_000);
  }

  ngOnDestroy(): void {
    if (this.clock) clearInterval(this.clock);
  }

  private updateTheme(): void {
    const now = new Date();
    const hour = now.getHours();
    this.isNight.set(hour >= 18 || hour < 6);
    this.currentTime.set(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }
}
