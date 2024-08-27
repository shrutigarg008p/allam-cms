import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLeagueCompetitionComponent } from './edit-league-competition.component';

describe('EditLeagueCompetitionComponent', () => {
  let component: EditLeagueCompetitionComponent;
  let fixture: ComponentFixture<EditLeagueCompetitionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditLeagueCompetitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditLeagueCompetitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
