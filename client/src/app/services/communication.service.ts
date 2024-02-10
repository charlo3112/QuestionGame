import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { Observable, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    toggleGameVisibility(id: string): Observable<HttpResponse<string>> {
        return this.http.patch(`${this.baseUrl}/game/${id}`, null, {
            observe: 'response',
            responseType: 'text',
        });
    }
    deleteGame(id: string): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/game/${id}`, { observe: 'response', responseType: 'text' });
    }

    exportGame(id: string): Observable<HttpResponse<string>> {
        return this.http.get(`${this.baseUrl}/game/${id}`, { observe: 'response', responseType: 'text' });
    }

    getAdminGames(): Observable<Game[]> {
        return this.http.get<Game[]>(`${this.baseUrl}/game/admin`).pipe(
            catchError((error) => {
                console.error('Error fetching admin games:', error);
                return of([]);
            }),
        );
    }

    addGame(game: Game): Observable<string> {
        return this.http.post<string>(`${this.baseUrl}/game`, game, { responseType: 'text' as 'json' });
    }

    login(password: string): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/admin`, { password }, { observe: 'response', responseType: 'text' });
    }

    verifyTitle(title: string): Observable<boolean> {
        return this.http.post<boolean>(`${this.baseUrl}/game/verify/`, { title });
    }
}
