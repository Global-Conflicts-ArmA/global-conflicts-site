import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {CookieService} from 'ngx-cookie-service';

import {Router} from '@angular/router';
import {DiscordUser} from '../models/discorduser';

@Injectable({
	providedIn: 'root'
})
export class UserService {

	constructor(private httpClient: HttpClient, private cookieService: CookieService, private router: Router) {
	}

	public logout() {
		this.httpClient.get('api/auth/logout').subscribe(value => {
			this.cookieService.deleteAll();
			window.location.replace('/');
		});
	}

	public getUserLocally(): DiscordUser | null {
		const token = this.cookieService.get('token');
		const username = this.cookieService.get('username');
		const role = this.cookieService.get('role');
		const roleColor = this.cookieService.get('roleColor');
		if (token) {
			return new DiscordUser(token, username, role, roleColor);
		} else {
			return null;
		}
	}




}
