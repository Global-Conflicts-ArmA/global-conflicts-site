import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule} from '@angular/router';
import {AppRoutingModule} from './app-routing.module';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LayoutModule} from '@angular/cdk/layout';

import {SharedModule} from './shared/shared.module';

import {ApiService} from './shared/api.service';
import {AuthGuardWithForcedLogin} from './shared/auth-guard-with-forced-login.service';
import {AuthGuard} from './shared/auth-guard.service';
import {AuthService} from './shared/auth.service';

import {OAuthModule} from 'angular-oauth2-oidc';
import {HomeComponent} from './components/home/home.component';
import {MissionListComponent} from './components/mission-list/mission-list.component';
import {MissionUploadComponent} from './components/mission-upload/mission-upload.component';
import {ToolbarComponent} from './components/toolbar/toolbar.component';
import {NotFoundComponent} from './components/not-found/not-found.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@NgModule({
	declarations: [
		AppComponent,
		HomeComponent,
		MissionListComponent,
		MissionUploadComponent,
		ToolbarComponent,
		NotFoundComponent
	],
	imports: [
		CommonModule,
		BrowserModule,
		AppRoutingModule,
		RouterModule,
		FormsModule,
		ReactiveFormsModule,
		BrowserAnimationsModule,
		HttpClientModule,
		SharedModule.forRoot(),
		OAuthModule.forRoot(),
		LayoutModule,
		NgxDatatableModule
	],
	bootstrap: [AppComponent],
	providers: [
		ApiService,
		AuthGuardWithForcedLogin,
		AuthGuard,
		AuthService
	]
})
export class AppModule {
}
