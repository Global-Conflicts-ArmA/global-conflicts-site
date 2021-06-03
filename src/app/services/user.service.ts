import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { DatabaseUser } from '../models/databaseUser';
import { RemoteDiscordUser } from '../models/remoteDiscordUser';
import {DiscordUser} from "@app/models/discordUser";

@Injectable({
	providedIn: 'root'
})
export class UserService {
	userCache: RemoteDiscordUser[] = [];

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

	public getUserLocally(): DatabaseUser | null {
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
			return new DatabaseUser(
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

	public list(): Observable<DatabaseUser[]> {
		return this.httpClient.get<DatabaseUser[]>('/api/users');
	}
	public listDiscordUsers(): Observable<DiscordUser[]> {
		return this.httpClient.get<DiscordUser[]>('/api/users/discord_users');
	}

	public async getDiscordUsername(id: string): Promise<string> {
		const user = this.userCache.find((result) => {
			return result.userID === id;
		});
		if (user) {

			return user.nickname ?? user.displayName ?? 'error';
		} else {
			return this.httpClient
				.get<RemoteDiscordUser>('/api/users/fetch/' + id)
				.toPromise()
				.then(async (result) => {
					try {
						const remoteUser = await this.httpClient
							.get<RemoteDiscordUser>('/api/users/fetch/' + id)
							.toPromise();
						if (remoteUser) {
							this.userCache.push(remoteUser);
							return (
								remoteUser.nickname ??
								remoteUser.displayName ??
								'error'
							);
						} else {
							return 'error';
						}
					} catch (err) {
						console.log('error: ', err);
						return 'error';
					}
				})
				.catch((err) => {
					console.log('error: ', err);
					return 'error';
				});
		}
	}

	// public async getUserSettings(id: string): Promise<IUserSettings> {
	// 	return this.httpClient
	// 		.get<DatabaseUser>('/api/users/' + id)
	// 		.toPromise()
	// 		.then((user: DatabaseUser) => {
	// 			const settings = {
	// 				missionEditDM: true,
	// 				missionReportDM: true,
	// 				missionReviewDM: true,
	// 				missionRemoveDM: true,
	// 				missionAcceptDM: true
	// 			};
	// 			return settings;
	// 		})
	// 		.catch((err) => {
	// 			console.log('error: ', err);
	// 			const settings = {
	// 				missionEditDM: true,
	// 				missionReportDM: true,
	// 				missionReviewDM: true,
	// 				missionRemoveDM: true,
	// 				missionAcceptDM: true
	// 			};
	// 			return settings;
	// 		});
	// }

	public insertUserIds(authorId: string) {
		const userFound = this.userCache.find((value) => {
			return value.userID === authorId;
		});
		if (!userFound) {
			this.userCache.push({ userID: authorId });
		}
	}

	public async getAuthorsName(): Promise<RemoteDiscordUser[]> {
		await Promise.all(
			this.userCache.map(async (userOnCache) => {
				if (!userOnCache.displayName && userOnCache.userID != null) {
					await this.httpClient
						.get<RemoteDiscordUser>(
							'/api/users/fetch/' + userOnCache.userID
						)
						.toPromise()
						.then((remoteUser) => {
							if (remoteUser) {
								userOnCache.displayName =
									remoteUser.displayName;
							} else {
								return 'error';
							}
						});
				}
			})
		);

		return this.userCache;
	}
}

export interface IUserSettings {
	missionEditDM: boolean;
	missionReportDM: boolean;
	missionReviewDM: boolean;
	missionRemoveDM: boolean;
	missionAcceptDM: boolean;
}
