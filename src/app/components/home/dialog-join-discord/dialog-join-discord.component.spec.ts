import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogJoinDiscordComponent } from './dialog-join-discord.component';

describe('DialogJoinDiscordComponent', () => {
  let component: DialogJoinDiscordComponent;
  let fixture: ComponentFixture<DialogJoinDiscordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogJoinDiscordComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogJoinDiscordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
