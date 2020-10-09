import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {User} from './interfaces/';
import {OAuthService} from 'angular-oauth2-oidc';

const axios = require('axios').default;

@Injectable({providedIn: 'root'})
export class ApiService {

	constructor(
		private oauthService: OAuthService
	) {

	}

	private apiResponseSubject$ = new BehaviorSubject<string>('false');
	public apiResponse$ = this.apiResponseSubject$.asObservable();

	private OwnAvatarLinkSubject$ = new BehaviorSubject<string>('false');
	public OwnAvatarLink$ = this.OwnAvatarLinkSubject$.asObservable();

	private isAdminSubject$ = new BehaviorSubject<boolean>(false);
	public isAdmin$ = this.isAdminSubject$.asObservable();

	async getProtectedApiResponse() {
		const res = await axios.get('/api/health-check');
		return res.status === 200
			? this.apiResponseSubject$.next('☁ API Success')
			: this.apiResponseSubject$.next('🌩 API Error');
	}

	// userList: Array<User>;

	public async getUsers(): Promise<Array<User>> {
		const res = await axios.get('/api/users');
		return res.data;
	}

	public async getUser(userid: string): Promise<User> {
		const res = await axios.get('/api/users/' + userid);
		console.log(res.data);
		return res.data;
	}

	public async getMissions(): Promise<Array<User>> {
		const res = await axios.get('/api/missions');
		return res.data;
	}

	public async getUserElement(userid: string, elementType: string) {
		console.log('getting element:', elementType);
		const userInfo = await this.getUser(userid);
		if (userInfo == null) {
			return console.log('Error could not get element for: ', userid, 'element:', elementType);
		}
		if (elementType in userInfo) {
			return userInfo[elementType];
		} else {
			console.log('Error could not get element for: ', userid, 'element:', elementType);
		}
	}

	public async getUserAvatar(userid: string) {
		console.log('getting avatarLinkFor', userid);
		const avatarLink = await this.getUserElement(userid, 'avatarLink');
		console.log('avatarLink:', avatarLink);
		return avatarLink;
	}

	public async checkIfAdmin() {
		const userClaims = this.oauthService.getIdentityClaims();
		if (userClaims == null) {
			return false;
		}
		const userid = userClaims['id'];
		console.log('checking admin status');
		const isAdmin = await this.getUserElement(userid, 'isAdmin');
		console.log('admin status', isAdmin);
		this.isAdminSubject$.next(isAdmin);
		return isAdmin;
	}

	public async getOwnAvatarLink() {
		const userClaims = this.oauthService.getIdentityClaims();
		if (userClaims == null) {
			return '-';
		}
		if ('avatar' in userClaims) {
			const result = 'https://cdn.discordapp.com/avatars/' + userClaims['id'] + '/' + userClaims['avatar'] + '.png';
			this.OwnAvatarLinkSubject$.next(result);
			return result;
		}

	}

	public async saveUserInfo() {
		const userInfo = this.oauthService.getIdentityClaims();
		if (userInfo) {
			if (userInfo['id']) {
				userInfo['avatarLink'] = await this.getOwnAvatarLink();
				this.OwnAvatarLinkSubject$.next(userInfo['avatarLink']);
				console.log('attempting to save userInfo', userInfo);
				axios.post('/api/users', userInfo);
			}
		}
	}

}
