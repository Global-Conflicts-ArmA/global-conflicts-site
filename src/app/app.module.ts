import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { CommonModule, DatePipe } from '@angular/common';
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
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
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
import { MarkdownModule, MarkedOptions, MarkedRenderer } from 'ngx-markdown';
import { DialogSubmitUpdateComponent } from './components/mission-details/dialog-submit-update.component';
import { DialogActionsComponent } from './components/mission-details/dialog-actions/dialog-actions.component';

import { IConfig, NgxMaskModule } from 'ngx-mask';

import { MatSnackBarModule } from '@angular/material/snack-bar';
import * as Sentry from '@sentry/angular';
import { MatExpansionModule } from '@angular/material/expansion';

import { AngularMarkdownEditorModule } from 'angular-markdown-editor';

import { DialogAddGameplayHistoryComponent } from '@app/components/mission-details/dialog-add-gameplay-history/dialog-add-gameplay-history.component';
import { DialogAddAarComponent } from '@app/components/mission-details/dialog-add-aar/dialog-add-aar.component';
import { VotedMissionsComponent } from '@app/components/voted-missions/voted-missions.component';
import { DialogViewGmNotesComponent } from '@app/components/mission-details/dialog-view-gm-notes/dialog-view-gm-notes.component';
import { DialogSubmitAuditReviewComponent } from './components/mission-details/dialog-submit-audit-review/dialog-submit-audit-review.component';
import { TokenInterceptor } from "@app/interceptor/token-interceptor.service";
import { DialogJoinDiscordComponent } from './components/home/dialog-join-discord/dialog-join-discord.component';

const maskConfig: Partial<IConfig> = {
	validation: false
};

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
		DialogActionsComponent,
		DialogAddGameplayHistoryComponent,
		DialogAddAarComponent,
		DialogViewGmNotesComponent,
		VotedMissionsComponent,
		DialogSubmitAuditReviewComponent,
		DialogJoinDiscordComponent
	],
	imports: [
		CommonModule,
		BrowserModule.withServerTransition({ appId: 'serverApp' }),
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
		MatSnackBarModule,
		MatProgressSpinnerModule,
		BrowserAnimationsModule,
		MarkdownModule.forRoot({
			markedOptions: {
				provide: MarkedOptions,
				useValue: {
					renderer: new MarkedRenderer(),
					gfm: true,
					tables: true,
					breaks: true,
					pedantic: false,
					sanitize: false,
					smartLists: true,

					smartypants: false
				}
			}
		}),
		MatAutocompleteModule,
		NgxMaskModule.forRoot(maskConfig),
		MatExpansionModule,
		AngularMarkdownEditorModule.forRoot({
			// add any Global Options/Config you might want
			// to avoid passing the same options over and over in each components of your App
			iconlibrary: 'fa'
		})
	],
	bootstrap: [AppComponent],
	providers: [
		{
			provide: ErrorHandler,
			useValue: Sentry.createErrorHandler({
				showDialog: true
			})
		},
		{
			provide: Sentry.TraceService,
			deps: [Router]
		},
		{
			provide: APP_INITIALIZER,
			useFactory: () => () => {},
			deps: [Sentry.TraceService],
			multi: true
		},

		CookieService,
		MissionConstants,
		{
			provide: HTTP_INTERCEPTORS,
			useClass: HttpErrorInterceptor,
			multi: true,
			deps: [MatDialog]
		},
		{
			provide: HTTP_INTERCEPTORS,
			useClass: TokenInterceptor,
			multi: true
		},
		{ provide: BrowserXhr, useClass: CustExtBrowserXhr },
		{
			provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
			useValue: { appearance: 'fill' }
		},
		DatePipe,
		SharedService
	]
})
export class AppModule {}
