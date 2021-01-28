import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AARComponent } from './components/aar/aar.component';
import { HomeComponent } from './components/home/home.component';
import { MissionListComponent } from './components/mission-list/mission-list.component';
import { MissionUploadComponent } from './components/mission-upload/mission-upload.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { WikiComponent } from './components/wiki/wiki.component';
import { ShouldLoginComponent } from './should-login.component';

const routes: Routes = [
	{ path: '', component: HomeComponent },
	{ path: 'mission-upload', component: MissionUploadComponent },
	{ path: 'mission-list', component: MissionListComponent },
	{ path: 'should-login', component: ShouldLoginComponent },
	{ path: 'wiki', component: WikiComponent },
	{ path: 'aar', component: AARComponent },
	{ path: '**', component: NotFoundComponent }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {}
