// import { waitForAsync, TestBed } from '@angular/core/testing';
// import { CookieService } from 'ngx-cookie-service';
// import { HttpClient } from '@angular/common/http';
// import { UserService } from './user.service';
// import { RemoteDiscordUser } from '@app/models/remoteDiscordUser';
// import { of } from 'rxjs';
// import { DiscordUser } from '../models/discorduser'
//
// /**
//  * user service unit tests
//  * @author StatusRed
//  * @since 2021
//  */
// describe('UserService', () => {
//   let service: UserService;
// 	let httpClient: jasmine.SpyObj<HttpClient>;
// 	let cookieService: jasmine.SpyObj<CookieService>;
//
//   beforeEach(() => {
// 		const cookieSpy = jasmine.createSpyObj('CookieService', ['get', 'deleteAll']);
// 		const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
//
//     TestBed.configureTestingModule({
// 			providers: [
// 				UserService,
// 				[
// 					{provide: CookieService, useValue: cookieSpy},
// 					{provide: HttpClient, useValue: httpClientSpy}
// 				]
// 			]
// 		});
//     service = TestBed.inject(UserService);
// 		cookieService = TestBed.inject(CookieService) as jasmine.SpyObj<CookieService>;
// 		httpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
//   });
//
//   it('should be created', () => {
//     expect(service).toBeTruthy();
//   });
//
// 	describe('logout', () => {
// 		it('should call the logout endpoint', () => {
// 			httpClient.get.and.returnValue(of());
// 			cookieService.deleteAll.and.stub();
//
// 			service.logout();
// 		});
// 	});
//
// 	describe('list', () => {
// 		it('should return discord users', waitForAsync(() => {
// 			const discordUser: DiscordUser = new DiscordUser('x', 'x', 'StatusRed', 'Mission Maker', 'yellow', '');
// 			const expectedData: DiscordUser[] = [discordUser];
// 			httpClient.get.and.returnValue(of(expectedData));
//
// 			const actualData = service.list();
// 			actualData.subscribe(
// 				users => {
// 					expect(users).toEqual(expectedData);
// 				}
// 			);
//
// 			expect(httpClient.get.calls.count()).toBe(1, 'one call');
// 		}));
// 	});
//
// 	describe('getUserLocally', () => {
// 		it('given no token should return null', () => {
// 				const user = service.getUserLocally();
//
// 				expect(user).toBeNull();
// 		});
//
// 		it('given a valid token should return DiscordUser', () => {
// 				cookieService.get.and.returnValue('x');
//
// 				const user = service.getUserLocally();
//
// 				expect(user).toEqual(jasmine.any(DiscordUser));
// 		});
// 	});
//
// 	describe('insertUserIds', () => {
// 		it('given found user don\'t insert into the cache again', () => {
// 				const user: RemoteDiscordUser = new RemoteDiscordUser();
// 				const userId = 'StatusRed';
// 				user.userID = userId;
// 				const cache = [user];
// 				service.userCache = cache;
//
// 				service.insertUserIds(userId);
// 		});
//
// 		it('given not found user insert into the cache', () => {
// 				const userId = 'StatusRed';
//
// 				service.insertUserIds(userId);
//
// 				const foundUser = service.userCache.find(val => {
// 					return val.userID === userId;
// 				});
//
// 				if (foundUser) {
// 					expect(foundUser.userID).toEqual(userId);
// 				}
// 		});
// 	});
//
//   // describe('DiscordUser', () => {
// 	// 	it('should return if a member of our discord', () => {
// 	// 			const user: DiscordUser = new DiscordUser('1', 'x', 'StatusRed', 'role', 'yellow', 'x');
//   //       const expectedResult = true;
//   //
//   //       const actualResult = user.isAMemberOfOurDiscord();
//   //
//   //       expect(actualResult).toEqual(expectedResult);
// 	// 	});
//   //
// 	// 	it('should return true when isProcessed called given role length greater than 0', () => {
//   //     const role = 'Mission Maker';
//   //     const user: DiscordUser = new DiscordUser('1', 'x', 'StatusRed', role, 'yellow', 'x');
//   //     const expectedResult = true;
//   //
//   //     const actualResult = user.isProcessed();
//   //
//   //     expect(actualResult).toEqual(expectedResult);
// 	// 	});
//   //
//   //   it('should return false when isProcessed called given role length equal to 0', () => {
//   //     const role = '';
//   //     const user: DiscordUser = new DiscordUser('1', 'x', 'StatusRed', role, 'yellow', 'x');
//   //     const expectedResult = false;
//   //
//   //     const actualResult = user.isProcessed();
//   //
//   //     expect(actualResult).toEqual(expectedResult);
// 	// 	});
//   //
//   //   it('should return false when isTrustedMissionMaker called given role is not trusted', () => {
//   //     const role = 'Noob';
//   //     const user: DiscordUser = new DiscordUser('1', 'x', 'StatusRed', role, 'yellow', 'x');
//   //     const expectedResult = false;
//   //
//   //     const actualResult = user.isTrustedMissionMaker();
//   //
//   //     expect(actualResult).toEqual(expectedResult);
// 	// 	});
//   //
//   //   it('should return true when isTrustedMissionMaker called given role is trusted', () => {
//   //     const role = 'Mission Maker';
//   //     const user: DiscordUser = new DiscordUser('1', 'x', 'StatusRed', role, 'yellow', 'x');
//   //     const expectedResult = true;
//   //
//   //     const actualResult = user.isTrustedMissionMaker();
//   //
//   //     expect(actualResult).toEqual(expectedResult);
// 	// 	});
// 	// });
//
// // Code written in an almost untestable way
//   // describe('getUserSettings', () => {
// 	// 	it('given an error should return settings', waitForAsync(() => {
//   //     const expectedSettings = {
//   // 			missionEditDM: true,
//   // 			missionReportDM: true,
//   // 			missionReviewDM: true,
//   // 			missionRemoveDM: true,
//   // 			missionAcceptDM: true
// 	// 		};
//   //
//   //     httpClient.get.and.returnValue(of({err: 'Error'}))
// 	// 		// httpClient.get.and.throwError('An error occured.');
//   //
// 	// 		const settings = service.getUserSettings('StatusRed');
//   //
//   //     expect(settings).toEqual(expectedSettings);
// 	// 		expect(httpClient.get.calls.count()).toBe(1, 'one call');
// 	// 	}));
// 	// });
// });
