import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeagueCompetitionComponent } from './league.component';

describe('LeagueCompetitionComponent', () => {
  let component: LeagueCompetitionComponent;
  let fixture: ComponentFixture<LeagueCompetitionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeagueCompetitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeagueCompetitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
