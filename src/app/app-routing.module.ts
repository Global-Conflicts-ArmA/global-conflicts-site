import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {ShouldLoginComponent} from './should-login.component';
import {HomeComponent} from './components/home/home.component';
import {MissionUploadComponent} from './components/mission-upload/mission-upload.component';
import {MissionListComponent} from './components/mission-list/mission-list.component';
import {WikiComponent} from './components/wiki/wiki.component';
import {AARComponent} from './components/aar/aar.component';
import {NotFoundComponent} from './components/not-found/not-found.component';

const routes: Routes = [
	{path: '', component: HomeComponent},
	{path: 'mission-upload', component: MissionUploadComponent},
	{path: 'mission-list', component: MissionListComponent},
	{path: 'user-list', loadChildren: () => import('./list/list.module').then(m => m.ListModule)},
	{path: 'should-login', component: ShouldLoginComponent},
	{path: 'wiki', component: WikiComponent},
	{path: 'aar', component: AARComponent},
	{path: '**', component: NotFoundComponent},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {
}
