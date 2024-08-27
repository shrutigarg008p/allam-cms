import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyCompetitionComponent } from './daily-competition.component';

describe('DailyCompetitionComponent', () => {
  let component: DailyCompetitionComponent;
  let fixture: ComponentFixture<DailyCompetitionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DailyCompetitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyCompetitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
