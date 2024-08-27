import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSpecialComponent } from './list-special.component';

describe('ListSpecialComponent', () => {
  let component: ListSpecialComponent;
  let fixture: ComponentFixture<ListSpecialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListSpecialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListSpecialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
