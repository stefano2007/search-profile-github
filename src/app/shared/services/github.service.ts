import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { User } from '../interfaces/user';
import { UserSearch } from '../interfaces/user-search';
import { UserRepos } from '../interfaces/user-repos';

@Injectable({
  providedIn: 'root'
})
export class GithubService {

  constructor(private httpClient: HttpClient) { }
  //Hearder Default
  headersRequest = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Basic ${environment.github_Token}`
  });

  getUsersBySearchQuery(query: string, per_page: number, page: number, params_order_by : any): Observable<UserSearch>{
    let queryParams = new HttpParams({
      fromObject: {
        q: query,
        per_page: per_page,
        page: page
      }
    });

    if(params_order_by && params_order_by !== undefined ){
      queryParams = queryParams.set('sort', params_order_by.sort);
      queryParams = queryParams.set('order', params_order_by.order);
    }

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

  getStarsByUsername(username: string): Observable<any> {
    //TODO: Tenta Obter a primeira estrela, caso exista no header campo Link terá a ultima, pagina correspondente a numero de estrelas já que pedimos 1 registro por pagina.
    return this.httpClient
      .get<any>(`${environment.url_API}/users/${username}/starred?per_page=1`,{
        observe: 'response',
        headers: this.headersRequest
      })
      .pipe(
        retry(0),
        catchError(this.handleError)
      );
  }

  getRepositoriesByUsername(username: string): Observable<any> {
    return this.httpClient
      .get<UserRepos[]>(`${environment.url_API}/users/${username}/repos`,{
        headers: this.headersRequest
      })
      .pipe(
        retry(0),
        catchError(this.handleError)
      );
  }

  calcStars(headerLink: string) : string{
    let urlLastPage = headerLink?.split(',')[1];
    if(!urlLastPage){
      return '0';
    }

    //TODO: Revisar logica
    urlLastPage = urlLastPage.split(';')[0]?.replace('<','').replace('>','');

    let starsCount = urlLastPage.replace(/.*&page=(.*)/, '$1').trim()

    return starsCount;
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
