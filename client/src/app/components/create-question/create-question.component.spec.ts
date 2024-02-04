import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CreateQuestionComponent } from '@app/components/create-question/create-question.component';

describe('CreateQuestionComponent', () => {
    let component: CreateQuestionComponent;
    let fixture: ComponentFixture<CreateQuestionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CreateQuestionComponent],
            imports: [
                FormsModule,
                MatFormFieldModule,
                MatInputModule,
                MatSliderModule,
                MatButtonModule,
                MatIconModule,
                MatCheckboxModule,
                NoopAnimationsModule,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateQuestionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
});
