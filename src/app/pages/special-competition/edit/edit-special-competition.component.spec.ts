import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSpecialCompetitionComponent } from './edit-special-competition.component';

describe('EditSpecialCompetitionComponent', () => {
  let component: EditSpecialCompetitionComponent;
  let fixture: ComponentFixture<EditSpecialCompetitionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditSpecialCompetitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSpecialCompetitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
