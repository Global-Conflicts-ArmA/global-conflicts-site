import {ModuleWithProviders, NgModule, Optional, SkipSelf} from '@angular/core';
import {AuthConfig, OAuthModule, OAuthModuleConfig, OAuthService, OAuthStorage} from 'angular-oauth2-oidc';
import {ApiService} from './api.service';
import {authConfig} from './auth-config';
import {AuthGuardWithForcedLogin} from './auth-guard-with-forced-login.service';
import {AuthGuard} from './auth-guard.service';
import {authModuleConfig} from './auth-module-config';
import {AuthService} from './auth.service';

// We need a factory since localStorage is not available at AOT build time
export function storageFactory(): OAuthStorage {
	return localStorage;
}

@NgModule({
	providers: [
		ApiService,
		AuthService,
		OAuthService,
		OAuthModule
	],
	exports: [
		ApiService,
		AuthService,
		AuthGuard,
		AuthGuardWithForcedLogin,
	]
})

export class SharedModule {
	static forRoot(): ModuleWithProviders<SharedModule> {
		return {
			ngModule: SharedModule,
			providers: [
				{provide: AuthConfig, useValue: authConfig},
				{provide: OAuthModuleConfig, useValue: authModuleConfig},
				{provide: OAuthStorage, useFactory: storageFactory},
			]
		};
	}

	constructor(@Optional() @SkipSelf() parentModule: SharedModule) {
		if (parentModule) {
			throw new Error('SharedModule is already loaded. Import it in the AppModule only');
		}
	}
}
