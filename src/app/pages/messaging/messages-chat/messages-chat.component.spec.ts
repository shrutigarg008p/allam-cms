import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagesChatComponent } from './messages-chat.component';

describe('MessagesChatComponent', () => {
  let component: MessagesChatComponent;
  let fixture: ComponentFixture<MessagesChatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessagesChatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessagesChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
