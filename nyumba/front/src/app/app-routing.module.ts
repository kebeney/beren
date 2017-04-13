import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent }   from './dashboard.component';
import { HeroesComponent }      from './heroes.component';
import { HeroDetailComponent }  from './hero-detail.component';
import { RoomComponent } from './rooms.component';
import { RoomDetailComponent }  from './room-details.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard',      component: DashboardComponent },
  { path: 'detail/:id',     component: HeroDetailComponent },
  { path: 'heroes',         component: HeroesComponent },
  { path: 'rooms',          component: RoomComponent },
  { path: 'roomDetails/:roomNum/:roomName/:rent',component: RoomDetailComponent}
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
