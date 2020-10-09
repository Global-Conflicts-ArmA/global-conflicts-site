import {Component} from '@angular/core';
import {AuthService} from './shared/auth.service';
import {Observable} from 'rxjs';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html'
})

export class AppComponent {
	isAuthenticated: Observable<boolean>;
	isDoneLoading: Observable<boolean>;
	canActivateProtectedRoutes: Observable<boolean>;

	constructor(
		private authService: AuthService,
	) {
		this.isAuthenticated = this.authService.isAuthenticated$;
		this.isDoneLoading = this.authService.isDoneLoading$;
		this.canActivateProtectedRoutes = this.authService.canActivateProtectedRoutes$;

		this.authService.runInitialLoginSequence();
	}

	login() {
		this.authService.login();
	}

	logout() {
		this.authService.logout();
	}

	refresh() {
		this.authService.refresh();
	}

	reload() {
		window.location.reload();
	}

	clearStorage() {
		localStorage.clear();
	}

	logoutExternally() {
		window.open(this.authService.logoutUrl);
	}

	get hasValidToken() {
		return this.authService.hasValidToken();
	}

	get accessToken() {
		return this.authService.accessToken;
	}

	get refreshToken() {
		return this.authService.refreshToken;
	}

	get identityClaims() {
		return this.authService.identityClaims;
	}

	get idToken() {
		return this.authService.idToken;
	}
}
