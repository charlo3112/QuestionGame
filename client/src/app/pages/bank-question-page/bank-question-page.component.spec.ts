import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankQuestionPageComponent } from './bank-question-page.component';

describe('BankQuestionPageComponent', () => {
  let component: BankQuestionPageComponent;
  let fixture: ComponentFixture<BankQuestionPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BankQuestionPageComponent]
    });
    fixture = TestBed.createComponent(BankQuestionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
