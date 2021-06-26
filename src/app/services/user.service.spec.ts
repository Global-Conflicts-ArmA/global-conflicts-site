import { waitForAsync, TestBed } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DiscordUser } from '../models/discorduser';
import { UserService } from './user.service';
import { RemoteDiscordUser } from '@app/models/remoteDiscordUser';
import { of } from 'rxjs';

/**
 * user service unit tests
 * @author StatusRed
 * @since 2021
 */
fdescribe('UserService', () => {
  let service: UserService;
	let httpClient: jasmine.SpyObj<HttpClient>;
	// let httpTestingController: HttpTestingController;
	let cookieService: jasmine.SpyObj<CookieService>;

  beforeEach(() => {
		const cookieSpy = jasmine.createSpyObj('CookieService', ['get', 'deleteAll']);
		const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);

    TestBed.configureTestingModule({
			providers: [
				UserService,
				[
					{provide: CookieService, useValue: cookieSpy},
					{provide: HttpClient, useValue: httpClientSpy}
				]
			]
		});
    service = TestBed.inject(UserService);
		cookieService = TestBed.inject(CookieService) as jasmine.SpyObj<CookieService>;
		httpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
		// httpClient = TestBed.inject(HttpClient);
		// httpTestingController = TestBed.inject(HttpTestingController);
  });

	afterEach(() => {
	  // After every test, assert that there are no more pending requests.
	  // httpTestingController.verify();
	});

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

	describe('logout', () => {
		it('should call the logout endpoint', () => {
			// const url = 'api/auth/logout';
			// httpClient.get(url).subscribe(() => {
			// 	expect(cookieService.deleteAll).toHaveBeenCalled();
			// });
			httpClient.get.and.returnValue(of());
			cookieService.deleteAll.and.stub();

			service.logout();

			// const reqs = httpTestingController.match(url);
			// expect(reqs.length).toEqual(2);
			// reqs[0].flush(mockData);
			// reqs[1].flush(mockData);
		});
	});

	describe('list', () => {
		it('should return discord users', waitForAsync(() => {
			const discordUser: DiscordUser = new DiscordUser('x', 'x', 'StatusRed', 'Mission Maker', 'yellow', '');
			const expectedData: DiscordUser[] = [discordUser];
			httpClient.get.and.returnValue(of(expectedData));

			const actualData = service.list();
			actualData.subscribe(
				users => {
					expect(users).toEqual(expectedData);
				}
			);

			expect(httpClient.get.calls.count()).toBe(1, 'one call');
		}));
	});

	describe('getUserLocally', () => {
		it('given no token should return null', () => {
				const user = service.getUserLocally();

				expect(user).toBeNull();
		});

		it('given a valid token should return DiscordUser', () => {
				cookieService.get.and.returnValue('x');

				const user = service.getUserLocally();

				expect(user).toEqual(jasmine.any(DiscordUser));
		});
	});

	describe('insertUserIds', () => {
		it('given found user don\'t insert into the cache again', () => {
				const user: RemoteDiscordUser = new RemoteDiscordUser();
				const userId = 'StatusRed';
				user.userID = userId;
				const cache = [user];
				service.userCache = cache;

				service.insertUserIds(userId);
		});

		it('given not found user insert into the cache', () => {
				const userId = 'StatusRed';

				service.insertUserIds(userId);

				const foundUser = service.userCache.find(val => {
					return val.userID === userId;
				});

				if (foundUser) {
					expect(foundUser.userID).toEqual(userId);
				}
		});
	});

  describe('getUserSettings', () => {
		it('given an error should return settings', waitForAsync(() => {
      const expectedSettings = {
  			missionEditDM: true,
  			missionReportDM: true,
  			missionReviewDM: true,
  			missionRemoveDM: true,
  			missionAcceptDM: true
			};

      httpClient.get.and.returnValue(of({err: 'Error'}))
			// httpClient.get.and.throwError('An error occured.');

			const settings = service.getUserSettings('StatusRed');

      expect(settings).toEqual(expectedSettings);
			expect(httpClient.get.calls.count()).toBe(1, 'one call');
		}));
	});
});
