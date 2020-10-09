import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {authConfig} from './auth-config';
import {JwksValidationHandler} from 'angular-oauth2-oidc-jwks';
import {AuthConfig, OAuthErrorEvent, OAuthService} from 'angular-oauth2-oidc';
import {User} from './interfaces';
import {BehaviorSubject, combineLatest, Observable, ReplaySubject} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {ApiService} from '../shared/api.service';
import {HttpClient} from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class AuthService {
	private user$ = new BehaviorSubject<User | null>(null);

	private isAuthenticatedSubject$ = new BehaviorSubject<boolean>(false);
	public isAuthenticated$ = this.isAuthenticatedSubject$.asObservable();

	private isDoneLoadingSubject$ = new ReplaySubject<boolean>();
	public isDoneLoading$ = this.isDoneLoadingSubject$.asObservable();

	private isAdminSubject$ = new ReplaySubject<boolean>();
	public isAdmin$ = this.isAdminSubject$.asObservable();

	public canActivateProtectedRoutes$: Observable<boolean> = combineLatest([
		this.isAuthenticated$,
		this.isDoneLoading$
	]).pipe(map(values => values.every(b => b)));

	private navigateToLoginPage() {
		// TODO: Remember current URL
		this.router.navigateByUrl('/should-login');
	}

	setUser(user: User | null): void {
		console.log(user);
		this.user$.next(user);
		window.user = user;
	}

	constructor(
		private oauthService: OAuthService,
		private config: AuthConfig,
		private router: Router,
		private http: HttpClient,
		private apiService: ApiService
	) {

		this.oauthService.configure(authConfig);

		this.oauthService.tokenValidationHandler = new JwksValidationHandler();

		this.oauthService.responseType = 'code token';

		this.oauthService.logoutUrl = window.location.origin;

		// this.oauthService.setStorage(sessionStorage);

		// Useful for debugging:
		this.oauthService.events.subscribe(event => {
			if (event instanceof OAuthErrorEvent) {
				console.error(event);
			} else {
				console.warn(event);
			}
		});

		// This is tricky, as it might cause race conditions (where access_token is set in another
		// tab before everything is said and done there.
		// TODO: Improve this setup.
		window.addEventListener('storage', (event) => {
			// The `key` is `null` if the event was caused by `.clear()`
			if (event.key !== 'access_token' && event.key !== null) {
				return;
			}

			console.warn('Noticed changes to access_token (most likely from another tab), updating isAuthenticated');
			this.isAuthenticatedSubject$.next(this.oauthService.hasValidAccessToken());

			if (!this.oauthService.hasValidAccessToken()) {
				this.navigateToLoginPage();
			}
		});

		this.oauthService.events
			.subscribe(_ => {
				this.isAuthenticatedSubject$.next(this.oauthService.hasValidAccessToken());
			});

		this.oauthService.events
			.pipe(filter(e => ['token_received'].includes(e.type)))
			.subscribe(e => this.oauthService.loadUserProfile());

		this.oauthService.events
			.pipe(filter(e => ['logout'].includes(e.type)))
			.subscribe(e => this.isAuthenticatedSubject$.next(false));

		this.oauthService.events
			.pipe(filter(e => ['user_profile_loaded'].includes(e.type)))
			.subscribe(e => {
				this.apiService.saveUserInfo();
				this.apiService.getOwnAvatarLink();
				this.apiService.checkIfAdmin();
			});

		this.oauthService.events
			.pipe(filter(e => ['session_terminated', 'session_error'].includes(e.type)))
			.subscribe(e => {
				this.isAuthenticatedSubject$.next(false);
				this.navigateToLoginPage();
			});

		this.oauthService.setupAutomaticSilentRefresh();
		if (this.oauthService.hasValidAccessToken()) {
			this.oauthService.silentRefresh().catch(
				e => console.log(e)
			);
		}
		// this.oauthService.setupAutomaticSilentRefresh({}, 'access_token')
	}

	private loadWithoutDiscoveryDocument(): Promise<void> {
		this.oauthService.configure(this.config);
		return Promise.resolve();
	}

	public async runInitialLoginSequence(): Promise<void> {

		// 0. LOAD CONFIG:
		// First we have to tell the service to see how the IdServer is
		// currently configured:
		return this.loadWithoutDiscoveryDocument()

			// For demo purposes, we pretend the previous call was very slow
			// .then(() => new Promise(resolve => setTimeout(() => resolve(), 1000)))

			// 1. HASH LOGIN:
			// Try to log in via hash fragment after redirect back
			// from IdServer from initImplicitFlow:
			.then(() => this.oauthService.tryLogin())

			.then(async () => {
				if (this.oauthService.hasValidAccessToken()) {
					return Promise.resolve();
				}

				// 2. SILENT LOGIN:
				// Try to log in via silent refresh because the IdServer
				// might have a cookie to remember the user, so we can
				// prevent doing a redirect:
				return this.oauthService.silentRefresh()
					.then(() => Promise.resolve())
					.catch(result => {
						// Subset of situations from https://openid.net/specs/openid-connect-core-1_0.html#AuthError
						// Only the ones where it's reasonably sure that sending the
						// user to the IdServer will help.
						const errorResponsesRequiringUserInteraction = [
							'interaction_required',
							'login_required',
							'account_selection_required',
							'consent_required',
						];
						if (result
							&& result.reason
							&& errorResponsesRequiringUserInteraction.indexOf(result.reason.error) >= 0) {
							// 3. ASK FOR LOGIN:
							// At this point we know for sure that we have to ask the
							// user to log in, so we redirect them to the IdServer to
							// enter credentials.
							//
							// Enable this to ALWAYS force a user to login.
							// this.oauthService.initImplicitFlow();
							//
							// Instead, we'll now do this:
							console.warn('User interaction is needed to log in, we will wait for the user to manually log in.');
							return Promise.resolve();
						}
						// We can't handle the truth, just pass on the problem to the
						// next handler.
						return Promise.reject(result);
					});
			})

			.then(() => {
				this.isDoneLoadingSubject$.next(true);

				// Check for the strings 'undefined' and 'null' just to be sure. Our current
				// login(...) should never have this, but in case someone ever calls
				// initImplicitFlow(undefined | null) this could happen.
				if (this.oauthService.state && this.oauthService.state !== 'undefined' && this.oauthService.state !== 'null') {
					console.log('There was state, so we are sending you to: ' + this.oauthService.state);
					this.router.navigateByUrl(this.oauthService.state);
				}
			})
			.catch(() => this.isDoneLoadingSubject$.next(true));
	}

	public login(targetUrl?: string) {
		console.log(targetUrl);
		console.log(this.router.url);
		this.oauthService.initLoginFlow(targetUrl || this.router.url);
	}

	public logout() {
		this.oauthService.logOut();
	}

	public refresh() {
		this.oauthService.silentRefresh();
	}

	public hasValidToken() {
		return this.oauthService.hasValidAccessToken();
	}

	// These normally won't be exposed from a service like this, but
	// for debugging it makes sense.
	public get accessToken() {
		return this.oauthService.getAccessToken();
	}

	public get refreshToken() {
		return this.oauthService.getRefreshToken();
	}

	public get identityClaims() {
		return this.oauthService.getIdentityClaims();
	}

	public get idToken() {
		return this.oauthService.getIdToken();
	}

	public get logoutUrl() {
		return this.oauthService.logoutUrl;
	}

}
