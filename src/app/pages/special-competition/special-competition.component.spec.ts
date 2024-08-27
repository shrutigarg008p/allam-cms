import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialCompetitionComponent } from './special-competition.component';

describe('SpecialCompetitionComponent', () => {
  let component: SpecialCompetitionComponent;
  let fixture: ComponentFixture<SpecialCompetitionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecialCompetitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialCompetitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
