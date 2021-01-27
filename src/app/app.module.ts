import {NgModule} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule} from '@angular/router';
import {AppRoutingModule} from './app-routing.module';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RxReactiveFormsModule} from "@rxweb/reactive-form-validators"
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LayoutModule} from '@angular/cdk/layout';


import {OAuthModule} from 'angular-oauth2-oidc';
import {HomeComponent} from './components/home/home.component';
import {MainNavComponent} from './components/main-nav/main-nav.component';
import {MissionListComponent} from './components/mission-list/mission-list.component';
import {MissionUploadComponent} from './components/mission-upload/mission-upload.component';
import {NotFoundComponent} from './components/not-found/not-found.component';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {HttpErrorInterceptor} from './interceptor/httpInterceptor';
import {CookieService} from 'ngx-cookie-service';
import {CustExtBrowserXhr} from './services/cust-ext-browser-xhr';
import {BrowserXhr} from '@angular/http';

import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/form-field';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatStepperModule} from '@angular/material/stepper';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {MatInputModule} from '@angular/material/input';
import {MaterialFileInputModule} from 'ngx-material-file-input';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatChipsModule} from '@angular/material/chips';
import {MatSliderModule} from '@angular/material/slider';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

import {WikiComponent} from './components/wiki/wiki.component';
import {AARComponent} from './components/aar/aar.component';
import {MissionConstants} from './constants/missionConstants';

@NgModule({
	declarations: [
		AppComponent,
		HomeComponent,
		MainNavComponent,
		MissionListComponent,
		MissionUploadComponent,
		NotFoundComponent,
		WikiComponent,
		AARComponent,
	],
	imports: [
		CommonModule,
		BrowserModule,
		AppRoutingModule,
		RouterModule,
		BrowserAnimationsModule,
		HttpClientModule,
		OAuthModule.forRoot(),
		LayoutModule,
		NgxDatatableModule,
		MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
		MatMenuModule,
		MatStepperModule,
		FormsModule,
		ReactiveFormsModule,
		MatInputModule,
		MaterialFileInputModule,
		RxReactiveFormsModule,
		MatRadioModule,
		MatSelectModule,
		MatChipsModule,
		MatSliderModule,
		MatCheckboxModule,
		MatButtonToggleModule,
		MatSlideToggleModule,
	],
	bootstrap: [AppComponent],
	providers: [
		CookieService,
		MissionConstants,
		{
			provide: HTTP_INTERCEPTORS,
			useClass: HttpErrorInterceptor,
			multi: true
		},
		{provide: BrowserXhr, useClass: CustExtBrowserXhr},
		{provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'fill'}},
	]
})
export class AppModule {
}
