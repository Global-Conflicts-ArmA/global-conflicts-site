import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from '../../services/user.service';
import { UserSettingsComponent } from './user-settings.component';

describe('UserSettingsComponent', () => {
	let component: UserSettingsComponent;
	let fixture: ComponentFixture<UserSettingsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [UserService],
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
