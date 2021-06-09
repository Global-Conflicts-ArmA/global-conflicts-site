import { async, inject, ComponentFixture, TestBed } from '@angular/core/testing';
import { VotedMissionsComponent } from './voted-missions.component';
import { UserService } from '../../services/user.service';
import { MissionsService } from '../../services/missions.service';

xdescribe('VotedMissionsComponent', () => {
  let component: VotedMissionsComponent;
  let fixture: ComponentFixture<VotedMissionsComponent>;
  let userService: UserService;
  let missionsService: MissionsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VotedMissionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(async(inject([UserService, MissionsService], (s: UserService, m: MissionsService) => {
		userService = s;
		missionsService = m;
		fixture = TestBed.createComponent(VotedMissionsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	})));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
