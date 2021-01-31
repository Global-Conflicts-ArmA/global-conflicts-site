import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionDetailsComponent } from './mission-details.component';

describe('MissionDetailsComponent', () => {
  let component: MissionDetailsComponent;
  let fixture: ComponentFixture<MissionDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MissionDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
