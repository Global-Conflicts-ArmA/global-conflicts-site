import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { DiscordUser } from '../models/discorduser';

@Injectable({
	providedIn: 'root'
})
export class UserService {
	constructor(
		private httpClient: HttpClient,
		private cookieService: CookieService
	) {}

	public logout() {
		this.httpClient.get('api/auth/logout').subscribe(() => {
			this.cookieService.deleteAll();
			window.location.replace('/');
		});
	}

	public getUserLocally(): DiscordUser | null {
		const id = this.cookieService.get('id');
		const token = this.cookieService.get('token');
		const username = this.cookieService.get('username');
		const role = this.cookieService.get('role');
		const roleColor = this.cookieService.get('roleColor');
		const avatarLink =
			'https://cdn.discordapp.com/avatars/' +
			this.cookieService.get('id') +
			'/' +
			this.cookieService.get('avatar') +
			'.png';
		if (token) {
			return new DiscordUser(
				id,
				token,
				username,
				role,
				roleColor,
				avatarLink
			);
		} else {
			return null;
		}
	}
}
