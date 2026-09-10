import { Routes } from '@angular/router';
import { SitePage } from './site-page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: SitePage, data: { page: 'about' } },
  { path: 'school', component: SitePage, data: { page: 'school' } },
  { path: 'academic', component: SitePage, data: { page: 'academic' } },
  { path: 'ai', component: SitePage, data: { page: 'ai' } },
  { path: 'sports', component: SitePage, data: { page: 'sports' } },
  { path: 'art', component: SitePage, data: { page: 'art' } },
  { path: 'admission', component: SitePage, data: { page: 'admission' } },
  { path: 'events', component: SitePage, data: { page: 'events' } },
  { path: 'about', component: SitePage, data: { page: 'about' } },
];
