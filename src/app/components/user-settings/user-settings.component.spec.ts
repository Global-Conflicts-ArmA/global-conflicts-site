import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule} from '@angular/common/http/testing';
import { UserService } from '../../services/user.service';
import { UserSettingsComponent } from './user-settings.component';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';

describe('UserSettingsComponent', () => {
	let component: UserSettingsComponent;
	let fixture: ComponentFixture<UserSettingsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HttpClientTestingModule, MatDialogModule],
			providers: [
			 {
				 provide: MatDialogRef,
				 useValue: {}
			 },
			UserService
			],
			declarations: [UserSettingsComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(UserSettingsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
