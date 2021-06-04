import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { MissionDetailsComponent } from './components/mission-details/mission-details.component';
import { MissionListComponent } from './components/mission-list/mission-list.component';
import { MissionUploadComponent } from './components/mission-upload/mission-upload.component';
import { WikiComponent } from './components/wiki/wiki.component';
import { AARComponent } from './components/aar/aar.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';
import { VotedMissionsComponent } from "@app/components/voted-missions/voted-missions.component";

const routes: Routes = [
	{ path: '', component: HomeComponent },
	{ path: 'mission-upload', component: MissionUploadComponent },
	{
		path: 'mission-details/:id',
		component: MissionDetailsComponent
	},
	{ path: 'mission-list', component: MissionListComponent },
	{ path: 'top-voted-missions', component: VotedMissionsComponent },
	{ path: 'user-settings', component: UserSettingsComponent },
	{ path: 'wiki', component: WikiComponent },
	{ path: 'aar', component: AARComponent },
	{ path: '**', component: NotFoundComponent }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {}
