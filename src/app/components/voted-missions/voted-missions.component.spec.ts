import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VotedMissionsComponent } from './voted-missions.component';

describe('VotedMissionsComponent', () => {
  let component: VotedMissionsComponent;
  let fixture: ComponentFixture<VotedMissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VotedMissionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VotedMissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
