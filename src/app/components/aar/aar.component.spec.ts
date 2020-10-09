import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AarComponent } from './aar.component';

describe('AarComponent', () => {
  let component: AarComponent;
  let fixture: ComponentFixture<AarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
