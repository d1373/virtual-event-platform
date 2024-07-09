import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { AuthGuard } from './auth/auth-guard.service';
import { HomeComponent } from './home/home.component';
import { MeetingComponent } from './meeting/meeting.component';
import { EndComponent } from './end/end.component';

export const routes: Routes = [
  { path: '', component: AuthComponent },
{ path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
{ path: 'meet/:meetingName/:meetingId', component: MeetingComponent },
  { path: 'end', component: EndComponent },
  { path: '**', redirectTo: 'home' }
];
