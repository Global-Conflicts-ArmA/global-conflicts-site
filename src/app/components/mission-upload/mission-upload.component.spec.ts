import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionUploadComponent } from './mission-upload.component';

describe('MissionUploadComponent', () => {
	let component: MissionUploadComponent;
	let fixture: ComponentFixture<MissionUploadComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [MissionUploadComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(MissionUploadComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
