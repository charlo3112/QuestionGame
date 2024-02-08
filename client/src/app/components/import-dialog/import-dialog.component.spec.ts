import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ValidationService } from '@app/services/validation.service';
import { ImportDialogComponent } from './import-dialog.component';

describe('ImportDialogComponent', () => {
    let component: ImportDialogComponent;
    let fixture: ComponentFixture<ImportDialogComponent>;
    let validationServiceSpy: jasmine.SpyObj<ValidationService>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ImportDialogComponent>>;
    const timeout = 1000;

    beforeEach(async () => {
        validationServiceSpy = jasmine.createSpyObj('ValidationService', ['validateGame', 'filterJSONInput']);
        validationServiceSpy.validateGame.and.returnValue([]);
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

        await TestBed.configureTestingModule({
            imports: [MatDialogModule, MatButtonModule, MatInputModule, NoopAnimationsModule, FormsModule, ImportDialogComponent],
            providers: [
                { provide: ValidationService, useValue: validationServiceSpy },
                { provide: MatDialogRef, useValue: dialogRefSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ImportDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not call validationService.validateGame when no file is selected', () => {
        const fileList = {} as FileList;
        component.onFileSelected(fileList);
        expect(validationServiceSpy.validateGame).not.toHaveBeenCalled();
    });

    it('should get an error when the file is not a JSON file', () => {
        const file = new File([''], 'filename', { type: 'text/plain' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        const fileList = dataTransfer.files;

        component.onFileSelected(fileList);

        setTimeout(() => {
            expect(component.validationErrors.length).toBe(1);
        }, timeout);
    });

    it('should return an error when the json file is not valid', () => {
        const file = new File(['{}'], 'filename', { type: 'application/json' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        const fileList = dataTransfer.files;

        validationServiceSpy.validateGame.and.returnValue(['error']);

        component.onFileSelected(fileList);

        setTimeout(() => {
            expect(component.validationErrors.length).toBe(1);
        }, timeout);
    });

    it('should return an error when the json file is not correctly parsed', () => {
        const file = new File(['{}'], 'filename', { type: 'application/json' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        const fileList = dataTransfer.files;

        validationServiceSpy.filterJSONInput.and.returnValue({ ok: false, error: 'error' });

        component.onFileSelected(fileList);

        setTimeout(() => {
            expect(component.validationErrors.length).toBe(1);
        }, timeout);
    });

    it('should load data if the json file is valid', () => {
        const file = new File(['{}'], 'filename', { type: 'application/json' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        const fileList = dataTransfer.files;

        const game = { title: 'title' };

        validationServiceSpy.filterJSONInput.and.returnValue({ ok: true, value: game });

        component.onFileSelected(fileList);

        setTimeout(() => {
            expect(component.data.ok).toBeTrue();
        }, timeout);
    });

    it('should close the dialog when clicking on the close button', () => {
        component.onNoClick();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });

    it('should not import the game if the name is not valid', () => {
        component.data = { ok: true, value: { title: '' } };
        component.validName = false;
        component.onImport();
        expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });

    it('should import the game if the name is valid', () => {
        component.data = { ok: true, value: { title: 'title' } };
        component.validName = true;
        component.onImport();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });

    it('should set the name of the game', () => {
        component.data = { ok: true, value: { title: 'title' } };
        const event = { target: { value: 'test' } } as unknown as Event;
        component.verifyAndSetNewName(event);
        expect(component.data.value.title).toBe('test');
    });
});