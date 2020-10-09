import {AuthConfig} from 'angular-oauth2-oidc';

const scopes = 'identify email';

export const authConfig: AuthConfig = {
	loginUrl: 'https://discord.com/api/oauth2/authorize',
	logoutUrl: 'http://localhost:4200/dashboard',
	tokenEndpoint: 'https://discord.com/api/oauth2/token',
	revocationEndpoint: 'https://discord.com/api/oauth2/token/revoke',
	// redirectUri: 'http://localhost:4200/index.html',
	userinfoEndpoint: 'https://discordapp.com/api/users/@me',
	clientId: '731266255306227813',
	dummyClientSecret: '8OY3LYa9uOmxwIfwd58PWCq2e772URCA',
	scope: scopes,
	responseType: 'code',
	strictDiscoveryDocumentValidation: false,
	oidc: false,
	disablePKCE: false,
	requestAccessToken: true,
	requireHttps: 'remoteOnly',
	useSilentRefresh: true,
	silentRefreshRedirectUri: 'http://localhost:4200/silent-refresh.html',
	silentRefreshTimeout: 5, // For faster testing
	sessionChecksEnabled: true,
	postLogoutRedirectUri: 'http://localhost:4200/index.html',
	timeoutFactor: 0.25, // For faster testing
	showDebugInformation: true,
};
