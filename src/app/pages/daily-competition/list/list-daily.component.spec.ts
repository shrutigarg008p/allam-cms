import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListDailyComponent } from './list-daily.component';

describe('ListDailyComponent', () => {
  let component: ListDailyComponent;
  let fixture: ComponentFixture<ListDailyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListDailyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListDailyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
