import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';


import {UserlistComponent} from './userlist/userlist.component';

@NgModule({
	declarations: [UserlistComponent],
	imports: [
		CommonModule,
		RouterModule.forChild([
			// { path: '', redirectTo: 'public', pathMatch: 'full' },
			// { path: '', component: Admin1Component, canActivate: [AuthGuard] },
			{path: 'users', component: UserlistComponent},
		]),
	]
})
export class ListModule {
}
