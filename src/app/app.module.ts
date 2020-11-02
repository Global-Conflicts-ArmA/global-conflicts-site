import {NgModule} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule} from '@angular/router';
import {AppRoutingModule} from './app-routing.module';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LayoutModule} from '@angular/cdk/layout';


import {OAuthModule} from 'angular-oauth2-oidc';
import {HomeComponent} from './components/home/home.component';
import {MissionListComponent} from './components/mission-list/mission-list.component';
import {MissionUploadComponent} from './components/mission-upload/mission-upload.component';
import {ToolbarComponent} from './components/toolbar/toolbar.component';
import {NotFoundComponent} from './components/not-found/not-found.component';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {HttpErrorInterceptor} from './interceptor/httpInterceptor';
import {CookieService} from 'ngx-cookie-service';
import {CustExtBrowserXhr} from './services/cust-ext-browser-xhr';
import {BrowserXhr} from '@angular/http';

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
		OAuthModule.forRoot(),
		LayoutModule,
		NgxDatatableModule
	],
	bootstrap: [AppComponent],
	providers: [
		CookieService,
		{
			provide: HTTP_INTERCEPTORS,
			useClass: HttpErrorInterceptor,
			multi: true
		},
		{provide: BrowserXhr, useClass: CustExtBrowserXhr}
	]
})
export class AppModule {
}
