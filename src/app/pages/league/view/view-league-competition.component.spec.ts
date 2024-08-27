import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDailyCompetitionComponent } from './edit-daily-competition.component';

describe('EditDailyCompetitionComponent', () => {
  let component: EditDailyCompetitionComponent;
  let fixture: ComponentFixture<EditDailyCompetitionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditDailyCompetitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDailyCompetitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
