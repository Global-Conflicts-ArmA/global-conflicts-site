import { async, inject, ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule} from '@angular/common/http/testing';
import { UserService } from '../../services/user.service';
import {Router} from "@angular/router";
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';

/**
 * home component unit tests
 * @author StatusRed
 * @since 2021
 */
describe('HomeComponent', () => {
	let component: HomeComponent;
	let fixture: ComponentFixture<HomeComponent>;
	let userService: UserService;
	let router: Router;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [MatDialogModule, HttpClientTestingModule, RouterTestingModule],
			declarations: [HomeComponent],
			providers: [
			 {
				 provide: MatDialogRef,
				 useValue: {}
			 },
			UserService
		]
		}).compileComponents();
	});

	beforeEach(async(inject([UserService, Router], (s: UserService, r: Router) => {
		userService = s;
		router = r;
		fixture = TestBed.createComponent(HomeComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	})));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
