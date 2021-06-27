import { async, ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MainNavComponent } from './main-nav.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule} from '@angular/common/http/testing';
import {MatMenuModule} from '@angular/material/menu';
import { UserService } from '../../services/user.service';
import {Router} from "@angular/router";
import { environment } from 'src/environments/environment';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';

/**
 * main-nav component unit tests
 * @author StatusRed
 * @since 2021
 */
describe('MainNavComponent', () => {
	let component: MainNavComponent;
	let fixture: ComponentFixture<MainNavComponent>;
	let userService: UserService;
	let router: Router;

	beforeEach(
		waitForAsync(() => {
			TestBed.configureTestingModule({
				declarations: [MainNavComponent],
				imports: [
					NoopAnimationsModule,
					MatIconModule,
					MatListModule,
					MatSidenavModule,
					MatToolbarModule,
					RouterTestingModule,
					HttpClientTestingModule,
					MatMenuModule,
					MatDialogModule
				],
				providers: [
		     {
		       provide: MatDialogRef,
		       useValue: {}
		     },
     		UserService
  ]
			}).compileComponents();
		})
	);

	beforeEach(async(inject([UserService, Router], (s: UserService, r: Router) => {
		userService = s;
		router = r;
		fixture = TestBed.createComponent(MainNavComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	})));

	it('should compile', () => {
		expect(component).toBeTruthy();
	});

	describe('on logging out', () => {
		it('should call UserService.logout', async(() => {
			const logoutSpy = spyOn(userService, 'logout').and.stub();

			component.logout();

			expect(logoutSpy).toHaveBeenCalled();
		}));
	});

	describe('on opening mission list', () => {
		it('should navigate to mission-list', async(() => {
			const navigateSpy = spyOn(router, 'navigate').and.stub();
			const expectedRoute = ['mission-list'];

			component.openMissionList();

			expect(navigateSpy).toHaveBeenCalledWith(expectedRoute);
		}));
	});

	describe('on opening upload form', () => {
		it('should navigate to mission-upload', async(() => {
			const navigateSpy = spyOn(router, 'navigate').and.stub();
			const expectedRoute = ['mission-upload'];

			component.openUploadForm();

			expect(navigateSpy).toHaveBeenCalledWith(expectedRoute);
		}));
	});

	describe('on getting discord link', () => {
		it('should return correct links', () => {
			const expectedProdLink = 'https://discord.com/api/oauth2/authorize?client_id=731266255306227813&redirect_uri=https%3A%2F%2Fglobalconflicts.net%2Fapi%2Fauth%2Fcallback&response_type=code&scope=identify%20guilds';
			const expectedNonProdLink = 'https://discord.com/api/oauth2/authorize?client_id=731266255306227813&redirect_uri=http%3A%2F%2Flocalhost%3A4200%2Fapi%2Fauth%2Fcallback&response_type=code&scope=identify%20guilds';

			environment.production = true;
			const actualLinkProd = component.getDiscordHref();

			environment.production = false;
			const actualLinkNonProd = component.getDiscordHref();

			expect(actualLinkProd).toEqual(expectedProdLink);
			expect(actualLinkNonProd).toEqual(expectedNonProdLink);
		});
	});
});
