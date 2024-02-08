import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Game } from '../interfaces/game';
import { Question } from '../interfaces/question';

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

    addQuestion(question: Question): Observable<HttpResponse<Question>> {
        return this.http.post<Question>(`${this.baseUrl}/question`, question, { observe: 'response' });
    }

    getGameById(gameId: string): Observable<HttpResponse<Game>> {
        //Remplacer Question par Game quand on aura l'interface
        return this.http.get<any>(`${this.baseUrl}/game/${gameId}`);
    }
}
