import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    toggleGameVisibility(id: string, value: boolean): Observable<HttpResponse<string>> {
        return this.http.patch(`${this.baseUrl}/game/${id}`, { value }, { observe: 'response', responseType: 'text' });
    }

    deleteGame(id: string): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/game/${id}`, { observe: 'response', responseType: 'text' });
    }

    exportGame(id: string): Observable<HttpResponse<Blob>> {
        return this.http.get(`${this.baseUrl}/game/${id}`, { observe: 'response', responseType: 'blob' });
    }

    getAllQuestions(): Observable<HttpResponse<Question[]>> {
        return this.http.get<Question[]>(`${this.baseUrl}/question`, { observe: 'response' });
    }
}
