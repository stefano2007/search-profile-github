import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { User } from '../interfaces/user';
import { UserSearch } from '../interfaces/user-search';

@Injectable({
  providedIn: 'root'
})
export class GithubService {

  constructor(private httpClient: HttpClient) { }
  //Hearder Default
  headersRequest = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${environment.github_Token}`
  });

  getUsersBySearchQuery(query: string, per_page: number = 10, page: number = 1): Observable<UserSearch>{
    const queryParams = new HttpParams({
      fromObject: {
        q: query,
        per_page: per_page,
        page: page
      }
    });

    return this.httpClient
      .get<UserSearch>(`${environment.url_API}/search/users`,{
        params: queryParams,
        headers: this.headersRequest
      })
      .pipe(
        retry(0),
        catchError(this.handleError)
      );
  }

  getUserByUsername(username: string): Observable<User>{
    return this.httpClient
      .get<User>(`${environment.url_API}/users/${username}`,{
        headers: this.headersRequest
      })
      .pipe(
        retry(0),
        catchError(this.handleError)
      );
  }

  // Error handling
  handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if(error.status == '0'){
        alert(`There seems to be a problem with the network connection. \nDetails: ${error.message}`);
      }
    }
    return throwError(() => {
      return errorMessage;
    });
  }
}
