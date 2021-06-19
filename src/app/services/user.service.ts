import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { RemoteDiscordUser } from '../models/remoteDiscordUser';

import { util } from 'prismjs';
import { DialogJoinDiscordComponent } from "@app/components/home/dialog-join-discord/dialog-join-discord.component";
import { MatDialog } from "@angular/material/dialog";

@Injectable({
	providedIn: 'root'
})
export class UserService {
	userCache: RemoteDiscordUser[] = [];

	private _loggedUser: User | null;

	constructor(
		private httpClient: HttpClient,
		private cookieService: CookieService,
		public dialog: MatDialog,
	) {}

	public logout() {
		this.httpClient.get('api/auth/logout').subscribe(() => {
			this.cookieService.deleteAll();
			window.location.replace('/');
		});
	}

	public list(): Observable<User[]> {
		return this.httpClient.get<User[]>('/api/users');
	}

	public listDiscordUsers(): Observable<RemoteDiscordUser[]> {
		return this.httpClient.get<RemoteDiscordUser[]>(
			'/api/users/discord_users'
		);
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
	// 		.get<User>('/api/users/' + id)
	// 		.toPromise()
	// 		.then((user: User) => {
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

	async saveUser() {
		this.httpClient.get<User>('/api/auth/login').subscribe(
			(user) => {
				this._loggedUser = new User(
					user.deleted,
					user.nickname,
					user.userID,
					user.roleslist,
					user.displayName,
					user.avatar,
				);
				localStorage.setItem('user', JSON.stringify(user));
			},
			(error) => {

				console.log(error);
			}
		);
	}

	getUserFromLocalStorage() {
		const userString = localStorage.getItem('user');
		if (typeof userString === 'string') {
			return JSON.parse(userString);
		} else {
			return null;
		}
	}

	saveToken(token: string) {
		localStorage.setItem('token', token);
	}

	getToken() {
		return localStorage.getItem('token');
	}

	get loggedUser(): User | null {
		if (this._loggedUser) {
			return this._loggedUser;
		} else {
			const user = this.getUserFromLocalStorage();
			if (user) {
				this._loggedUser = new User(
					user.deleted,
					user.nickname,
					user.userID,
					user.roleslist,
					user.displayName,
					user.avatar,
				);
				return this._loggedUser;
			} else {
				return null;
			}
		}
	}
}

export interface IUserSettings {
	missionEditDM: boolean;
	missionReportDM: boolean;
	missionReviewDM: boolean;
	missionRemoveDM: boolean;
	missionAcceptDM: boolean;
}
