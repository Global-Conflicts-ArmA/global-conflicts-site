import { LayoutModule } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserXhr } from '@angular/http';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { OAuthModule } from 'angular-oauth2-oidc';
import { CookieService } from 'ngx-cookie-service';
import { MaterialFileInputModule } from 'ngx-material-file-input';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { MainNavComponent } from './components/main-nav/main-nav.component';
import { MissionListComponent } from './components/mission-list/mission-list.component';
import { MissionUploadComponent } from './components/mission-upload/mission-upload.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

import { HttpErrorInterceptor } from './interceptor/httpInterceptor';
import { CustExtBrowserXhr } from './services/cust-ext-browser-xhr';

import { AARComponent } from './components/aar/aar.component';
import { WikiComponent } from './components/wiki/wiki.component';
import { MissionConstants } from './constants/missionConstants';
import { MissionDetailsComponent } from './components/mission-details/mission-details.component';

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
		MissionDetailsComponent
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
		MatTooltipModule
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
		{ provide: BrowserXhr, useClass: CustExtBrowserXhr },
		{
			provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
			useValue: { appearance: 'fill' }
		}
	]
})
export class AppModule {}
