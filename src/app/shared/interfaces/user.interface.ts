export interface User {
	id: string;
	username: string;
	avatar: string | null | undefined;
	avatarLink: string | null | undefined;
	discriminator: string;
	bot?: boolean;
	email?: string;
	flags?: number;
	locale?: string;
	verified?: boolean;
	mfa_enabled?: boolean;
	premium_type?: number;
	isAdmin?: boolean;
}

export interface TokenRequestResult {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
}
