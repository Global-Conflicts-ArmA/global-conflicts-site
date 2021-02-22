import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { AppComponent } from './app.component';
import { LayoutModule } from '@angular/cdk/layout';
import { OAuthModule } from 'angular-oauth2-oidc';
import { HttpErrorInterceptor } from './interceptor/httpInterceptor';
import { CookieService } from 'ngx-cookie-service';
import { CustExtBrowserXhr } from './services/cust-ext-browser-xhr';
import { BrowserXhr } from '@angular/http';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { HomeComponent } from './components/home/home.component';
import { MainNavComponent } from './components/main-nav/main-nav.component';
import { MissionListComponent } from './components/mission-list/mission-list.component';
import { MissionUploadComponent } from './components/mission-upload/mission-upload.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { WikiComponent } from './components/wiki/wiki.component';
import { AARComponent } from './components/aar/aar.component';
import { MissionConstants } from './constants/missionConstants';
import { MissionDetailsComponent } from './components/mission-details/mission-details.component';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';
import { SharedService } from './services/shared';
import { DialogViewUpdateComponent } from './components/mission-details/dialog-view-update.component';
import { DialogViewBugReportComponent } from './components/mission-details/dialog-view-bug-report.component';
import { DialogSubmitBugReportComponent } from './components/mission-details/dialog-submit-bug-report.component';
import { DialogViewReviewComponent } from './components/mission-details/dialog-view-review.component';
import { DialogSubmitReviewComponent } from './components/mission-details/dialog-submit-review.component';
import { MarkdownModule } from 'ngx-markdown';
import { DialogSubmitUpdateComponent } from './components/mission-details/dialog-submit-update.component';
import { DialogEditDetailsComponent } from './components/mission-details/dialog-edit-details.component';

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
		MissionDetailsComponent,
		UserSettingsComponent,
		DialogViewUpdateComponent,
		DialogViewBugReportComponent,
		DialogSubmitBugReportComponent,
		DialogViewReviewComponent,
		DialogSubmitReviewComponent,
		DialogSubmitUpdateComponent,
		DialogEditDetailsComponent
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
		MatTooltipModule,
		MatDialogModule,
		MatTableModule,
		MatPaginatorModule,
		MatSortModule,
		MatProgressSpinnerModule,
		BrowserAnimationsModule,
		MarkdownModule.forRoot(),
		MatAutocompleteModule
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
		},
		SharedService
	]
})
export class AppModule {}
