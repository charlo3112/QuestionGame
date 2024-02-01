import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Message } from '@common/message';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    basicGet(): Observable<Message> {
        return this.http.get<Message>(`${this.baseUrl}/example`).pipe(catchError(this.handleError<Message>('basicGet')));
    }

    basicPost(message: Message): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/example/send`, message, { observe: 'response', responseType: 'text' });
    }

    toggleGameVisibility(id: string, value: boolean): Observable<HttpResponse<string>> {
        return this.http.patch(`${this.baseUrl}/game/${id}`, { value }, { observe: 'response', responseType: 'text' });
    }

    deleteGame(id: string): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/game/${id}`, { observe: 'response', responseType: 'text' });
    }

    exportGame(id: string): Observable<HttpResponse<Blob>> {
        return this.http.get(`${this.baseUrl}/game/${id}`, { observe: 'response', responseType: 'blob' });
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
