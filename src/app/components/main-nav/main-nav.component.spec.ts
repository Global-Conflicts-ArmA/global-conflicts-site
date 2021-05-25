import { LayoutModule } from '@angular/cdk/layout';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MainNavComponent } from './main-nav.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import {MatMenuModule} from '@angular/material/menu';

describe('MainNavComponent', () => {
	let component: MainNavComponent;
	let fixture: ComponentFixture<MainNavComponent>;

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
					MatMenuModule
				]
			}).compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent(MainNavComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should compile', () => {
		expect(component).toBeTruthy();
	});
});
