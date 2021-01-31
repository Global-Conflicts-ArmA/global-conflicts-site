import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AARComponent } from './aar.component';

describe('AARComponent', () => {
	let component: AARComponent;
	let fixture: ComponentFixture<AARComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AARComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AARComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
