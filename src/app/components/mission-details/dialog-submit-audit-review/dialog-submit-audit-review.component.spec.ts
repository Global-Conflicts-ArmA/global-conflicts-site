import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogSubmitAuditReviewComponent } from './dialog-submit-audit-review.component';

xdescribe('DialogSubmitAuditReviewComponent', () => {
  let component: DialogSubmitAuditReviewComponent;
  let fixture: ComponentFixture<DialogSubmitAuditReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogSubmitAuditReviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogSubmitAuditReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
