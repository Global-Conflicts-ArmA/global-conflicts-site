import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable, of, Subscription } from 'rxjs';
import { DiscordUser } from '../models/discorduser';
import { RemoteDiscordUser } from '../models/remoteDiscordUser';

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

	public list(): Observable<DiscordUser[]> {
		return this.httpClient.get<DiscordUser[]>('/api/users');
	}

	public async getDiscordUsername(id: string): Promise<string> {
		return this.httpClient
			.get<RemoteDiscordUser>('/api/users/fetch/' + id)
			.toPromise()
			.then((remoteUser: RemoteDiscordUser) => {
				if (remoteUser) {
					console.log('remoteUser: ', remoteUser);
					return remoteUser.nickname
						? remoteUser.nickname
						: remoteUser.displayName
						? remoteUser.displayName
						: 'error';
				} else {
					return 'error';
				}
			})
			.catch((err) => {
				console.log('error: ', err);
				return 'error';
			});
	}

	public async getUserSettings(id: string): Promise<IUserSettings> {
		return this.httpClient
			.get<DiscordUser>('/api/users/' + id)
			.toPromise()
			.then((user: DiscordUser) => {
				const settings = {
					missionEditDM: true,
					missionReportDM: true,
					missionReviewDM: true,
					missionRemoveDM: true,
					missionAcceptDM: true
				};
				return settings;
			})
			.catch((err) => {
				console.log('error: ', err);
				const settings = {
					missionEditDM: true,
					missionReportDM: true,
					missionReviewDM: true,
					missionRemoveDM: true,
					missionAcceptDM: true
				};
				return settings;
			});
	}
}

export interface IUserSettings {
	missionEditDM: boolean;
	missionReportDM: boolean;
	missionReviewDM: boolean;
	missionRemoveDM: boolean;
	missionAcceptDM: boolean;
}
