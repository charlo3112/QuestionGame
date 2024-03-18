import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbandonDialogComponent } from './abandon-dialog.component';

describe('AbandonDialogComponent', () => {
  let component: AbandonDialogComponent;
  let fixture: ComponentFixture<AbandonDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AbandonDialogComponent]
    });
    fixture = TestBed.createComponent(AbandonDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
