import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionBankAdminComponent } from './question-bank-admin.component';

describe('QuestionBankAdminComponent', () => {
  let component: QuestionBankAdminComponent;
  let fixture: ComponentFixture<QuestionBankAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QuestionBankAdminComponent]
    });
    fixture = TestBed.createComponent(QuestionBankAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
