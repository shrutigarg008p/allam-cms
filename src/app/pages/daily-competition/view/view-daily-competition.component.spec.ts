import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDailyCompetitionComponent } from './view-daily-competition.component';

describe('ViewDailyCompetitionComponent', () => {
  let component: ViewDailyCompetitionComponent;
  let fixture: ComponentFixture<ViewDailyCompetitionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewDailyCompetitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewDailyCompetitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
